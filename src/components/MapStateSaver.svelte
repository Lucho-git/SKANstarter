<!-- MapStateSaver.svelte -->
<script>
  import {
    confirmedMarkersStore,
    removeMarkerStore,
    markerActionsStore,
  } from "../stores/mapStore"
  import { supabase } from "../lib/supabaseClient"
  import { page } from "$app/stores"

  async function synchronizeMarkers() {
    const session = $page.data.session
    if (!session) {
      console.error("User not authenticated")
      return
    }

    try {
      const latestMarkers = await retrieveLatestMarkersFromServer(session)
      console.log("Latest markers from server:", latestMarkers)

      const localMarkers = $confirmedMarkersStore

      let {
        localMarkersToBeAdded,
        localMarkersToBeUpdated,
        localMarkersToBeDeleted,
        serverMarkersToBeAdded,
        serverMarkersToBeUpdated,
        serverMarkersToBeDeleted,
      } = compareMarkers(localMarkers, latestMarkers)

      console.log("Local markers to be added:", localMarkersToBeAdded)
      console.log("Local markers to be updated:", localMarkersToBeUpdated)
      console.log("Local markers to be deleted:", localMarkersToBeDeleted)
      console.log("Server markers to be added:", serverMarkersToBeAdded)
      console.log("Server markers to be updated:", serverMarkersToBeUpdated)
      console.log("Server markers to be deleted:", serverMarkersToBeDeleted)

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
    } catch (error) {
      console.error("Error synchronizing markers:", error)
    }
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
          serverMarkersToBeAdded.push(localMarker)
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
    console.log("Sending local changes to server...")

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

    // Process markers to be added
    if (serverMarkersToBeAdded.length > 0) {
      const addMarkerData = serverMarkersToBeAdded.map((marker) => {
        const { marker: mapboxMarker, id, last_confirmed } = marker
        const coordinates = mapboxMarker.getLngLat().toArray()
        const iconClass =
          mapboxMarker.getElement().querySelector("i")?.className || "default"

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
        const iconClass =
          mapboxMarker.getElement().querySelector("i")?.className || "default"

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

    console.log("Local changes sent to server successfully")
  }

  async function saveMapStateToDatabase() {
    const session = $page.data.session
    if (!session) {
      console.error("User not authenticated")
      return
    }

    const markerInserts = await prepareMapStateForSaving(session)
    console.log("Markers to save:", markerInserts)

    const { data, error } = await supabase
      .from("map_markers")
      .upsert(markerInserts, { onConflict: "id" })

    if (error) {
      console.error("Error saving map markers to database:", error)
    } else {
      console.log("Map markers saved to database successfully:", data)
    }
  }

  async function retrieveLatestMarkersFromServer(session) {
    console.log("Retrieving latest markers from server...")

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

    // Retrieve the latest markers from the server
    const { data: latestMarkers, error: markersError } = await supabase
      .from("map_markers")
      .select("id, marker_data, last_confirmed")
      .eq("master_map_id", masterMapId)

    if (markersError) {
      console.error(
        "Error retrieving latest markers from server:",
        markersError,
      )
      throw new Error("Failed to retrieve latest markers from server")
    }

    return latestMarkers
  }

  async function prepareMapStateForSaving(session) {
    console.log("Preparing map state for saving...")

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

    const markerInserts = []

    confirmedMarkersStore.subscribe((markers) => {
      markers.forEach(({ marker, id, last_confirmed }) => {
        const feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: marker.getLngLat().toArray(),
          },
          properties: {
            icon:
              marker.getElement().querySelector("i")?.className || "default",
            // Add any additional metadata properties here
            id: id,
          },
        }

        const markerData = {
          master_map_id: masterMapId,
          id: id,
          marker_data: feature,
          last_confirmed: last_confirmed, // Include the timestamp as the last_confirmed field
        }

        markerInserts.push(markerData)
      })
    })

    // Add vehicle locations to the markerInserts array
    // Implement the logic to retrieve vehicle locations and add them as separate markers

    return markerInserts
  }
</script>

<button
  class="btn btn-circle btn-md absolute top-40 right-20 z-10"
  on:click={synchronizeMarkers}>Save Map State</button
>
