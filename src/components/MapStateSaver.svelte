<!-- MapStateSaver.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import {
    confirmedMarkersStore,
    removeMarkerStore,
    markerActionsStore,
    syncStore,
  } from "../stores/mapStore"

  import { mapActivityStore } from "../stores/mapActivityStore"
  import { profileStore } from "../stores/profileStore"
  import { LngLatBounds } from "mapbox-gl"
  import { markerBoundaryStore } from "$lib/stores/homeBoundaryStore"
  import { supabase } from "../lib/supabaseClient"
  import { toast } from "svelte-sonner"
  import { debounce } from "lodash-es"

  let confirmedMarkersUnsubscribe
  let debouncedSynchronizeMarkers
  let synchronizationInProgress = false
  let channel
  let masterMapId
  let userId
  export let map

  onMount(() => {
    masterMapId = $profileStore.master_map_id
    userId = $profileStore.id
    debouncedSynchronizeMarkers = debounce(synchronizeMarkers, 500)

    channel = supabase
      .channel("map_markers_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "map_markers",
          filter: `master_map_id=eq.${masterMapId}`, // Add filter for specific map
        },
        async (payload) => {
          // First check if it's current user's change
          if (payload.new.update_user_id === userId) {
            console.log("Skipping synchronization, update made by current user")
            return
          }

          // Try to find user in connected profiles
          let username = "Another user"
          const connectedUser = $mapActivityStore.connected_profiles.find(
            (profile) => profile.id === payload.new.update_user_id,
          )

          if (connectedUser) {
            username = connectedUser.full_name
          } else {
            // Only query database if user not found locally
            const { data: user } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", payload.new.update_user_id)
              .single()

            if (user) {
              username = user.full_name
            }
          }

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
        },
      )
      .subscribe()

    synchronizeMarkers("Loaded from server")

    confirmedMarkersUnsubscribe = confirmedMarkersStore.subscribe((markers) => {
      if (!synchronizationInProgress) {
        debouncedSynchronizeMarkers()
      }
    })

    syncStore.update((store) => ({
      ...store,
      synchronizeMarkers: synchronizeMarkers,
    }))
  })

  onDestroy(() => {
    console.log("Destroying MapStateSaver")
    debouncedSynchronizeMarkers.cancel()

    if (confirmedMarkersUnsubscribe) {
      confirmedMarkersUnsubscribe()
    }

    if (channel) {
      supabase.removeChannel(channel)
    }

    console.log("Removing all markers from the map")
    confirmedMarkersStore.update((markers) => {
      markers.forEach(({ marker }) => {
        marker.remove()
      })
      return []
    })

    confirmedMarkersStore.set([])
    removeMarkerStore.set([])
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
    if (synchronizationInProgress) {
      console.log("Synchronization already in progress. Skipping.")
      return
    }

    synchronizationInProgress = true
    syncStore.update((store) => ({ ...store, spinning: true }))

    if (!userId) {
      console.error("User not authenticated")
      toast.error("User not authenticated")
      return
    }

    try {
      const latestMarkers = await retrieveLatestMarkersFromServer()
      const localMarkers = $confirmedMarkersStore

      let {
        localMarkersToBeAdded,
        localMarkersToBeUpdated,
        localMarkersToBeDeleted,
        serverMarkersToBeAdded,
        serverMarkersToBeUpdated,
        serverMarkersToBeDeleted,
      } = compareMarkers(localMarkers, latestMarkers)

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

      markerActionsStore.set(markerActions)

      await sendLocalChangesToServer({
        serverMarkersToBeAdded,
        serverMarkersToBeUpdated,
        serverMarkersToBeDeleted,
      })

      calculateAndStoreBoundingBox()

      if (toasttext) {
        toast.success(toasttext)
      }
    } catch (error) {
      console.error("Error synchronizing markers:", error)

      let errorTitle = "Synchronization Error"
      let errorMessage = error.message || "Error synchronizing markers"

      if (error.message === "No master map assigned") {
        errorTitle = "Map Assignment Error"
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

  async function sendLocalChangesToServer({
    serverMarkersToBeAdded,
    serverMarkersToBeUpdated,
    serverMarkersToBeDeleted,
  }) {
    if (!masterMapId) {
      throw new Error("No master map assigned")
    }

    // Process markers to be added
    if (serverMarkersToBeAdded.length > 0) {
      const addMarkerData = serverMarkersToBeAdded.map((marker) => {
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
        throw new Error("Failed to delete markers on server")
      }

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

  async function retrieveLatestMarkersFromServer() {
    if (!masterMapId) {
      throw new Error("No master map assigned")
    }

    const { data: latestMarkers, error: markersError } = await supabase
      .from("map_markers")
      .select("id, marker_data, last_confirmed, deleted, deleted_at")
      .eq("master_map_id", masterMapId)

    if (markersError) {
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
      markerBoundaryStore.set(bounds)
    } else {
      markerBoundaryStore.set(null)
    }
  }
</script>
