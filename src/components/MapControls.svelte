<!-- MapControls.svelte -->
<script>
  import { createEventDispatcher, onMount, onDestroy } from "svelte"
  import { confirmedMarkersStore } from "../stores/mapStore"

  export let map

  const dispatch = createEventDispatcher()

  let isDragging = false
  let longPressTimer = null
  let longPressOccurred = false
  let longPressStartPosition = null
  const longPressThreshold = 500
  const longPressMoveThreshold = 5
  let confirmedMarkers = []

  let confirmedMarkersUnsubscribe

  onMount(() => {
    document.addEventListener(
      "handleUpdateMarkerListeners",
      handleUpdateMarkerListeners,
    )

    // Add event listeners when the component mounts
    map.on("mousedown", handleMouseDown)
    map.on("touchstart", handleMouseDown)
    map.on("drag", handleMapDrag)
    map.on("mouseup", handleMouseUp)
  })

  onDestroy(() => {
    console.log("Destroying MapControls")

    // Unsubscribe from the confirmedMarkersStore
    console.log(
      "MapControls, unsubscribing from confirmedMarkersStore",
      confirmedMarkersUnsubscribe,
    )
    if (confirmedMarkersUnsubscribe) {
      console.log("Unsubscribing from confirmedMarkersStore, mapcontrols 1")
      confirmedMarkersUnsubscribe()
      console.log("Unsubscribed from confirmedMarkersStore, mapcontrols 2")
    }
    console.log("Out")

    // Remove the "iconChange" event listener
    document.removeEventListener(
      "handleUpdateMarkerListeners",
      handleUpdateMarkerListeners,
    )

    // Remove event listeners from the map
    map.off("mousedown", handleMouseDown)
    map.off("touchstart", handleMouseDown)
    map.off("drag", handleMapDrag)
    map.off("mouseup", handleMouseUp)
  })

  function updateMarkerListeners(marker, id) {
    const markerElement = marker.getElement()

    // Remove event listeners from the marker element
    markerElement.removeEventListener("mouseenter", handleMarkerMouseEnter)
    markerElement.removeEventListener("mouseleave", handleMarkerMouseLeave)
    markerElement.removeEventListener("click", handleMarkerClick)
    markerElement.removeAttribute("data-listeners-added")

    // Add event listeners to the marker element
    // console.log(`Adding event listeners to marker with ID: ${id}`)
    markerElement.addEventListener("mouseenter", handleMarkerMouseEnter)
    markerElement.addEventListener("mouseleave", handleMarkerMouseLeave)
    markerElement.addEventListener("click", handleMarkerClick)
    markerElement.setAttribute("data-listeners-added", "true")

    // Update the confirmedMarkers array with the new marker data
    const existingMarkerIndex = confirmedMarkers.findIndex((m) => m.id === id)
    if (existingMarkerIndex !== -1) {
      // If a marker with the same ID already exists, update it
      confirmedMarkers = confirmedMarkers.map((m, index) =>
        index === existingMarkerIndex ? { marker, id } : m,
      )
    } else {
      // If no marker with the same ID exists, add a new entry
      confirmedMarkers = [...confirmedMarkers, { marker, id }]
    }
  }

  function handleUpdateMarkerListeners(event) {
    const { marker, id } = event.detail
    updateMarkerListeners(marker, id)
  }

  function handleMarkerMouseEnter(event) {
    const markerElement = event.target
    markerElement.style.cursor = "pointer"
  }

  function handleMarkerMouseLeave(event) {
    const markerElement = event.target
    markerElement.style.cursor = ""
  }

  function handleMarkerClick(event) {
    event.stopPropagation()
    const markerElement = event.target.closest(".mapboxgl-marker")

    if (markerElement) {
      const foundMarker = confirmedMarkers.find(
        (m) => m.marker.getElement() === markerElement,
      )

      if (foundMarker) {
        const { marker, id } = foundMarker
        dispatch("markerClick", { marker, id })
      } else {
        console.log("No matching marker found in confirmedMarkers array")
      }
    } else {
      console.log("No marker element found")
    }
  }

  function handleMarkerPlacement(event) {
    const lngLat = event.lngLat || event.target.getLngLat()

    if (lngLat) {
      dispatch("markerPlacement", { lngLat })
    } else {
      console.error("Invalid event format. Missing lngLat property.")
    }
  }

  //   function handleMapClick(event) {
  //     if (!isDragging && !longPressOccurred && !event.defaultPrevented) {
  //       clearTimeout(longPressTimer)
  //       longPressTimer = null
  //       handleMarkerPlacement(event)
  //     }
  //     longPressOccurred = false
  //   }

  function handleMouseDown(event) {
    //Mapclick logic for longpress
    isDragging = false
    longPressOccurred = false
    clearTimeout(longPressTimer)
    longPressStartPosition = {
      x: event.originalEvent.clientX || event.originalEvent.touches[0].clientX,
      y: event.originalEvent.clientY || event.originalEvent.touches[0].clientY,
    }
    longPressTimer = setTimeout(() => {
      handleMarkerPlacement(event)
      longPressOccurred = true
      longPressTimer = null
    }, longPressThreshold)
  }

  function handleMapDrag(event) {
    if (longPressStartPosition) {
      const touchEvent = event.originalEvent.touches
        ? event.originalEvent.touches[0]
        : event.originalEvent
      const dx = touchEvent.clientX - longPressStartPosition.x
      const dy = touchEvent.clientY - longPressStartPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance > longPressMoveThreshold) {
        isDragging = true
        clearTimeout(longPressTimer)
        longPressTimer = null
        longPressStartPosition = null
      }
    }
  }

  function handleMouseUp(event) {
    isDragging = false
    clearTimeout(longPressTimer)
    longPressTimer = null
    longPressStartPosition = null
  }
</script>
