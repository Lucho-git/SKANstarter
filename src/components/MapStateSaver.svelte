<!-- MapStateSaver.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import {
    confirmedMarkersStore,
    removeMarkerStore,
    markerActionsStore,
  } from "../stores/mapStore"
  import { supabase } from "../lib/supabaseClient"
  import { page } from "$app/stores"
  import { toast } from "svelte-sonner"
  import { debounce } from "lodash-es"

  let spinning = false
  let confirmedMarkersUnsubscribe

  let debouncedSynchronizeMarkers
  let synchronizationInProgress = false
  let channel // Declare the channel variable

  onMount(() => {
    // Create a single debounced instance of the synchronizeMarkers function
    debouncedSynchronizeMarkers = debounce(synchronizeMarkers, 500)

    const session = $page.data.session // Get the session variable

    // Subscribe to changes in the 'map_markers' table
    channel = supabase
      .channel("map_markers_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "map_markers" },
        (payload) => {
          if (payload.new.update_user_id !== session.user.id) {
            // Update was made by another user
            if (!synchronizationInProgress) {
              debouncedSynchronizeMarkers("Server Sync")
            }
          } else {
            // Update was made by the current user
            // Skip synchronization
            console.log("Skipping synchronization, update made by current user")
          }
        },
      )
      .subscribe()

    synchronizeMarkers("Loaded from server")

    // Subscribe to changes in the confirmedMarkerStore
    confirmedMarkersUnsubscribe = confirmedMarkersStore.subscribe((markers) => {
      if (!synchronizationInProgress) {
        debouncedSynchronizeMarkers("Local Sync")
      }
    })
  })

  onDestroy(() => {
    console.log("Destroying MapStateSaver")
    // Cancel any pending debounced calls
    debouncedSynchronizeMarkers.cancel()

    if (confirmedMarkersUnsubscribe) {
      confirmedMarkersUnsubscribe()
    }

    // Unsubscribe from the Realtime subscription when the component is destroyed
    if (channel) {
      supabase.removeChannel(channel)
    }

    console.log("Removing all markers from the map")
    // Remove all markers from the map
    confirmedMarkersStore.update((markers) => {
      markers.forEach(({ marker }) => {
        marker.remove()
      })
      return []
    })

    // Clear the confirmedMarkersStore
    confirmedMarkersStore.set([])

    // Clear the removeMarkerStore
    removeMarkerStore.set([])

    // Clear the markerActionsStore
    markerActionsStore.set([])
  })

  async function synchronizeMarkers(toasttext) {
    console.log("Synchronizing markers...")
    if (synchronizationInProgress) {
      console.log("Synchronization already in progress. Skipping.")
      return
    }

    synchronizationInProgress = true
    spinning = true

    // console.log("Getting sessions")
    const session = $page.data.session
    if (!session) {
      console.error("User not authenticated")

      toast.error("User not authenticated")

      return
    }

    try {
      const latestMarkers = await retrieveLatestMarkersFromServer(session)
      //   console.log("Latest markers from server:", latestMarkers)

      const localMarkers = $confirmedMarkersStore

      let {
        localMarkersToBeAdded,
        localMarkersToBeUpdated,
        localMarkersToBeDeleted,
        serverMarkersToBeAdded,
        serverMarkersToBeUpdated,
        serverMarkersToBeDeleted,
      } = compareMarkers(localMarkers, latestMarkers)

      //   console.log("Local markers to be added:", localMarkersToBeAdded)
      //   console.log("Local markers to be updated:", localMarkersToBeUpdated)
      //   console.log("Local markers to be deleted:", localMarkersToBeDeleted)
      //   console.log("Server markers to be added:", serverMarkersToBeAdded)
      //   console.log("Server markers to be updated:", serverMarkersToBeUpdated)
      //   console.log("Server markers to be deleted:", serverMarkersToBeDeleted)

      //Add the local results into an action queue
      const markerActions = [
        ...localMarkersToBeAdded.map((marker) => ({
          action: "add",
          markerData: marker,
        })),
        ...localMarkersToBeUpdated.map((marker) => ({
          action: "update",
          markerData: marker,
        })),
        ...localMarkersToBeDeleted.map((marker) => ({
          action: "delete",
          markerData: marker,
        })),
      ]

      // Apply server changes to the local map
      markerActionsStore.set(markerActions)

      // Send local changes to the server
      await sendLocalChangesToServer(session, {
        serverMarkersToBeAdded,
        serverMarkersToBeUpdated,
        serverMarkersToBeDeleted,
      })
      toast.success(toasttext)
    } catch (error) {
      console.error("Error synchronizing markers:", error)

      let errorMessage = "Error synchronizing markers"

      if (error.message === "Failed to retrieve user profile") {
        errorMessage =
          "Please create a map or connect to a map for online synchronization."
      } else if (
        error.message ===
        "No master map assigned. Please create or connect to a map."
      ) {
        errorMessage =
          "No master map assigned. Please create or connect to a map."
      } else if (
        error.message === "Failed to retrieve latest markers from server"
      ) {
        errorMessage =
          "Failed to retrieve latest markers from the server. Please try again later."
      }

      toast.error(errorMessage)
    }
    synchronizationInProgress = false
    spinning = false
    // console.log("Synchronization complete")
  }

  function compareMarkers(localMarkers, serverMarkers) {
    let localMarkersToBeAdded = []
    let localMarkersToBeUpdated = []
    let localMarkersToBeDeleted = []
    let serverMarkersToBeAdded = []
    let serverMarkersToBeUpdated = []
    let serverMarkersToBeDeleted = []

    // Compare local markers with server markers
    for (const localMarker of localMarkers) {
      const serverMarker = serverMarkers.find(
        (marker) => marker.id === localMarker.id,
      )

      if (serverMarker) {
        if (serverMarker.deleted) {
          if (
            new Date(localMarker.last_confirmed) >
            new Date(serverMarker.deleted_at)
          ) {
            // If the local modification is newer than the deletion, update the server marker
            serverMarkersToBeUpdated.push(localMarker)
          } else {
            // If the deletion is newer, delete the local marker
            localMarkersToBeDeleted.push(localMarker)
          }
        } else if (
          new Date(serverMarker.last_confirmed) >
          new Date(localMarker.last_confirmed)
        ) {
          localMarkersToBeUpdated.push(serverMarker)
        } else if (
          new Date(localMarker.last_confirmed) >
          new Date(serverMarker.last_confirmed)
        ) {
          serverMarkersToBeUpdated.push(localMarker)
        }
      } else {
        const removedMarker = $removeMarkerStore.find(
          (marker) => marker.id === localMarker.id,
        )

        if (!removedMarker) {
          serverMarkersToBeAdded.push({
            ...localMarker,
            iconClass: localMarker.marker.getElement().querySelector("svg")
              ? `custom-svg-${localMarker.marker.getElement().querySelector("svg").dataset.icon}`
              : localMarker.marker.getElement().querySelector("ion-icon")
                ? `ionic-${localMarker.marker.getElement().querySelector("ion-icon").getAttribute("name")}`
                : localMarker.marker.getElement().querySelector("i")
                    ?.className || "default",
          })
        }
      }
    }

    // Compare server markers with local markers
    for (const serverMarker of serverMarkers) {
      const localMarker = localMarkers.find(
        (marker) => marker.id === serverMarker.id,
      )
      const removedMarker = $removeMarkerStore.find(
        (marker) => marker.id === serverMarker.id,
      )

      if (!localMarker && !serverMarker.deleted && !removedMarker) {
        localMarkersToBeAdded.push(serverMarker)
      }
    }

    // Process the removeMarkerStore
    for (const removedMarker of $removeMarkerStore) {
      const serverMarker = serverMarkers.find(
        (marker) => marker.id === removedMarker.id,
      )

      if (serverMarker) {
        if (
          new Date(removedMarker.last_confirmed) >=
          new Date(serverMarker.last_confirmed)
        ) {
          // If the removal last_confirmed is newer or equal to the server marker's last_confirmed,
          // add the marker to serverMarkersToBeDeleted
          serverMarkersToBeDeleted.push(serverMarker)
        }
      }
    }

    return {
      localMarkersToBeAdded,
      localMarkersToBeUpdated,
      localMarkersToBeDeleted,
      serverMarkersToBeAdded,
      serverMarkersToBeUpdated,
      serverMarkersToBeDeleted,
    }
  }

  async function sendLocalChangesToServer(
    session,
    {
      serverMarkersToBeAdded,
      serverMarkersToBeUpdated,
      serverMarkersToBeDeleted,
    },
  ) {
    const userId = session.user.id

    // Retrieve the user's profile to get the master_map_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("master_map_id")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error retrieving user profile:", profileError)
      throw new Error("Failed to retrieve user profile")
    }

    const masterMapId = profile.master_map_id

    // Helper function to get iconClass
    const getIconClass = (mapboxMarker) => {
      const element = mapboxMarker.getElement()
      if (element.querySelector("svg")) {
        return `custom-svg-${element.querySelector("svg").dataset.icon}`
      } else if (element.querySelector("ion-icon")) {
        return `ionic-${element.querySelector("ion-icon").getAttribute("name")}`
      } else {
        return element.querySelector("i")?.className || "default"
      }
    }

    // Process markers to be added
    if (serverMarkersToBeAdded.length > 0) {
      const addMarkerData = serverMarkersToBeAdded.map((marker) => {
        const { marker: mapboxMarker, id, last_confirmed } = marker
        const coordinates = mapboxMarker.getLngLat().toArray()
        const iconClass = getIconClass(mapboxMarker)

        const feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          properties: {
            icon: iconClass,
            id: id,
          },
        }

        return {
          master_map_id: masterMapId,
          id: id,
          marker_data: feature,
          last_confirmed: last_confirmed,
          update_user_id: userId,
        }
      })

      const { error: addError } = await supabase
        .from("map_markers")
        .insert(addMarkerData)

      if (addError) {
        console.error("Error adding markers to server:", addError)
        throw new Error("Failed to add markers to server")
      }
    }

    // Process markers to be updated
    if (serverMarkersToBeUpdated.length > 0) {
      const updateMarkerData = serverMarkersToBeUpdated.map((marker) => {
        const { marker: mapboxMarker, id, last_confirmed } = marker
        const coordinates = mapboxMarker.getLngLat().toArray()
        const iconClass = getIconClass(mapboxMarker)

        const feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          properties: {
            icon: iconClass,
            id: id,
          },
        }

        return {
          id: id,
          marker_data: feature,
          last_confirmed: last_confirmed,
          update_user_id: userId,
        }
      })

      const { error: updateError } = await supabase
        .from("map_markers")
        .upsert(updateMarkerData, { onConflict: "id" })

      if (updateError) {
        console.error("Error updating markers on server:", updateError)
        throw new Error("Failed to update markers on server")
      }
    }
    // Process markers to be deleted
    if (serverMarkersToBeDeleted.length > 0) {
      const deleteMarkerData = serverMarkersToBeDeleted.map((marker) => ({
        id: marker.id,
        deleted: true,
        deleted_at: new Date().toISOString(),
      }))

      const { error: deleteError } = await supabase
        .from("map_markers")
        .upsert(deleteMarkerData, { onConflict: "id" })

      if (deleteError) {
        console.error("Error deleting markers on server:", deleteError)
        throw new Error("Failed to delete markers on server")
      }

      // Remove the deleted markers from the removeMarkerStore
      removeMarkerStore.update((markers) =>
        markers.filter(
          (marker) =>
            !serverMarkersToBeDeleted.some(
              (deletedMarker) => deletedMarker.id === marker.id,
            ),
        ),
      )
    }
  }

  async function retrieveLatestMarkersFromServer(session) {
    const userId = session.user.id

    // Retrieve the user's profile to get the master_map_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("master_map_id")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error retrieving user profile:", profileError)
      throw new Error("Failed to retrieve user profile")
    }

    const masterMapId = profile.master_map_id

    if (!masterMapId) {
      throw new Error(
        "No master map assigned. Please create or connect to a map.",
      )
    }

    // Retrieve the latest markers from the server, excluding deleted markers
    const { data: latestMarkers, error: markersError } = await supabase
      .from("map_markers")
      .select("id, marker_data, last_confirmed, deleted")
      .eq("master_map_id", masterMapId)
      .is("deleted", null)

    if (markersError) {
      console.error(
        "Error retrieving latest markers from server:",
        markersError,
      )
      throw new Error("Failed to retrieve latest markers from server")
    }

    return latestMarkers.map((marker) => ({
      ...marker,
      iconClass: marker.marker_data.properties.icon,
    }))
  }
</script>

<button
  class="btn btn-circle btn-md absolute top-36 right-20 z-10"
  on:click={() => debouncedSynchronizeMarkers("Sync Button")}
>
  <svg
    class="w-6 h-6 {spinning ? 'animate-spin' : ''}"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
</button>
