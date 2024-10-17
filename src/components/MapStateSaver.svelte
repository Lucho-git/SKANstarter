<!-- MapStateSaver.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import {
    confirmedMarkersStore,
    removeMarkerStore,
    markerActionsStore,
    syncStore,
  } from "../stores/mapStore"
  import { LngLatBounds } from "mapbox-gl" // Or equivalent from your map library

  import { markerBoundaryStore } from "$lib/stores/homeBoundaryStore"

  import { supabase } from "../lib/supabaseClient"
  import { page } from "$app/stores"
  import { toast } from "svelte-sonner"
  import { debounce } from "lodash-es"

  let confirmedMarkersUnsubscribe

  let debouncedSynchronizeMarkers
  let synchronizationInProgress = false
  let channel // Declare the channel variable
  export let map

  onMount(() => {
    debouncedSynchronizeMarkers = debounce(synchronizeMarkers, 500)

    const session = $page.data.session

    channel = supabase
      .channel("map_markers_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "map_markers" },
        async (payload) => {
          if (payload.new.update_user_id !== session.user.id) {
            const { data: user } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", payload.new.update_user_id)
              .single()

            const username = user?.full_name || "Another user"
            const changeType = payload.eventType
            const iconClass =
              payload.new.marker_data?.properties?.icon || "unknown"
            const coordinates = payload.new.marker_data.geometry.coordinates
            const isDeleted = payload.new.deleted === true

            showChangeToast(
              username,
              changeType,
              iconClass,
              isDeleted,
              coordinates,
            )

            if (!synchronizationInProgress) {
              debouncedSynchronizeMarkers()
            }
          } else {
            console.log("Skipping synchronization, update made by current user")
          }
        },
      )
      .subscribe()

    synchronizeMarkers("Loaded from server")

    confirmedMarkersUnsubscribe = confirmedMarkersStore.subscribe((markers) => {
      if (!synchronizationInProgress) {
        debouncedSynchronizeMarkers()
      }
    })

    // Update the syncStore with the synchronizeMarkers function
    syncStore.update((store) => ({
      ...store,
      synchronizeMarkers: synchronizeMarkers,
    }))
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

  function showLocalChangeToast(changeType, iconClass, isDeleted) {
    let title = ""
    let description = ""

    switch (changeType) {
      case "add":
        title = "Marker Added"
        description = `You added a new ${iconClass} marker`
        toast.info(title, { description })
        break
      case "update":
        if (isDeleted) {
          title = "Marker Deleted"
          description = `You removed a ${iconClass} marker`
          toast.warning(title, { description })
        } else {
          title = "Marker Updated"
          description = `You updated a marker to ${iconClass}`
          toast.info(title, { description })
        }
        break
    }
  }

  function showChangeToast(
    username,
    changeType,
    iconClass,
    isDeleted,
    coordinates,
  ) {
    let title = ""
    let description = ""
    switch (changeType) {
      case "INSERT":
        title = "Marker Added"
        description = `${username} added a new ${iconClass} marker`
        toast.info(title, {
          description: description,
          action: {
            label: "Locate",
            onClick: () => {
              map.flyTo({
                center: coordinates,
                zoom: 15,
                duration: 1000,
              })
            },
          },
        })
        break
      case "UPDATE":
        if (isDeleted) {
          title = "Marker Deleted"
          description = `${username} removed a ${iconClass} marker`
          toast.warning(title, {
            description: description,
          })
        } else {
          title = "Marker Updated"
          description = `${username} updated a marker to ${iconClass}`
          toast.info(title, {
            description: description,
            action: {
              label: "Locate",
              onClick: () => {
                map.flyTo({
                  center: coordinates,
                  zoom: 15,
                  duration: 1000,
                })
              },
            },
          })
        }
        break
    }
  }

  async function synchronizeMarkers(toasttext) {
    // console.log("Synchronizing markers...")
    if (synchronizationInProgress) {
      console.log("Synchronization already in progress. Skipping.")
      return
    }

    synchronizationInProgress = true
    syncStore.update((store) => ({ ...store, spinning: true }))

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

      // Calculate and store the bounding box
      calculateAndStoreBoundingBox()

      if (toasttext) {
        toast.success(toasttext)
      }
    } catch (error) {
      console.error("Error synchronizing markers:", error)

      let errorTitle = "Synchronization Error"
      let errorMessage = error.message || "Error synchronizing markers"

      if (error.message === "Failed to retrieve user profile") {
        errorTitle = "User Profile Error"
      } else if (
        error.message ===
        "No master map assigned. Please create or connect to a map."
      ) {
        errorTitle = "Map Assignment Error"
      } else if (
        error.message === "Failed to retrieve latest markers from server"
      ) {
        errorTitle = "Server Communication Error"
      }

      toast.error(errorTitle, {
        description: error.details || errorMessage,
        action: {
          label: "Reload",
          onClick: () => {
            window.location.reload()
          },
        },
      })
    }
    synchronizationInProgress = false
    syncStore.update((store) => ({ ...store, spinning: false }))
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
            showLocalChangeToast("update", localMarker.iconClass, false)
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
          showLocalChangeToast("update", localMarker.iconClass, false)
        }
      } else {
        const removedMarker = $removeMarkerStore.find(
          (marker) => marker.id === localMarker.id,
        )

        if (!removedMarker) {
          let iconClass = localMarker.iconClass || "default"

          serverMarkersToBeAdded.push({
            ...localMarker,
            iconClass: iconClass,
          })
          showLocalChangeToast("add", localMarker.iconClass, false)
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
          showLocalChangeToast("update", serverMarker.iconClass, true)
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

    // Process markers to be added
    if (serverMarkersToBeAdded.length > 0) {
      const addMarkerData = serverMarkersToBeAdded.map((marker) => {
        const { marker: mapboxMarker, id, last_confirmed, iconClass } = marker
        const coordinates = mapboxMarker.getLngLat().toArray()
        console.log("servermarkerstobeadded4", iconClass)

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
        const { marker: mapboxMarker, id, last_confirmed, iconClass } = marker
        const coordinates = mapboxMarker.getLngLat().toArray()

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
      .select("id, marker_data, last_confirmed, deleted, deleted_at")
      .eq("master_map_id", masterMapId)

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

  function calculateAndStoreBoundingBox() {
    const markers = $confirmedMarkersStore
    if (markers.length > 0) {
      const bounds = new LngLatBounds()
      markers.forEach(({ marker }) => {
        bounds.extend(marker.getLngLat())
      })

      // Store the bounding box in the markerBoundaryStore
      markerBoundaryStore.set(bounds)
    } else {
      // If there are no markers, set the store to null
      markerBoundaryStore.set(null)
    }
  }
</script>
