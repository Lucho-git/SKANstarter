<!-- MapControls.svelte -->
<script>
  import { createEventDispatcher, onMount, onDestroy } from "svelte"
  import { confirmedMarkersStore } from "../stores/mapStore"
  import { controlStore, drawingModeEnabled } from "../stores/controlStore"

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
  let controlsEnabled = true
  let eventListenersActive = true

  // Subscribe to drawingModeEnabled store
  $: if ($drawingModeEnabled !== undefined) {
    controlsEnabled = !$drawingModeEnabled
    updateEventListeners(controlsEnabled)
  }

  function updateEventListeners(enabled) {
    if (!map) return

    if (enabled && !eventListenersActive) {
      map.on("mousedown", handleMouseDown)
      map.on("touchstart", handleMouseDown)
      map.on("drag", handleMapDrag)
      map.on("mouseup", handleMouseUp)
      eventListenersActive = true
    } else if (!enabled && eventListenersActive) {
      map.off("mousedown", handleMouseDown)
      map.off("touchstart", handleMouseDown)
      map.off("drag", handleMapDrag)
      map.off("mouseup", handleMouseUp)
      eventListenersActive = false
    }
  }

  onMount(() => {
    document.addEventListener(
      "handleUpdateMarkerListeners",
      handleUpdateMarkerListeners,
    )

    if (controlsEnabled) {
      updateEventListeners(true)
    }
  })

  onDestroy(() => {
    console.log("Destroying MapControls")

    if (confirmedMarkersUnsubscribe) {
      console.log("Unsubscribing from confirmedMarkersStore, mapcontrols 1")
      confirmedMarkersUnsubscribe()
      console.log("Unsubscribed from confirmedMarkersStore, mapcontrols 2")
    }
    console.log("Out")

    document.removeEventListener(
      "handleUpdateMarkerListeners",
      handleUpdateMarkerListeners,
    )

    updateEventListeners(false)
  })

  function updateMarkerListeners(marker, id) {
    const markerElement = marker.getElement()

    markerElement.removeEventListener("mouseenter", handleMarkerMouseEnter)
    markerElement.removeEventListener("mouseleave", handleMarkerMouseLeave)
    markerElement.removeEventListener("click", handleMarkerClick)
    markerElement.removeAttribute("data-listeners-added")

    markerElement.addEventListener("mouseenter", handleMarkerMouseEnter)
    markerElement.addEventListener("mouseleave", handleMarkerMouseLeave)
    markerElement.addEventListener("click", handleMarkerClick)
    markerElement.setAttribute("data-listeners-added", "true")

    const existingMarkerIndex = confirmedMarkers.findIndex((m) => m.id === id)
    if (existingMarkerIndex !== -1) {
      confirmedMarkers = confirmedMarkers.map((m, index) =>
        index === existingMarkerIndex ? { marker, id } : m,
      )
    } else {
      confirmedMarkers = [...confirmedMarkers, { marker, id }]
    }
  }

  function handleUpdateMarkerListeners(event) {
    const { marker, id } = event.detail
    updateMarkerListeners(marker, id)
  }

  function handleMarkerMouseEnter(event) {
    if (!controlsEnabled) return
    const markerElement = event.target
    markerElement.style.cursor = "pointer"
  }

  function handleMarkerMouseLeave(event) {
    if (!controlsEnabled) return
    const markerElement = event.target
    markerElement.style.cursor = ""
  }

  function handleMarkerClick(event) {
    if (!controlsEnabled) return

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
    if (!controlsEnabled) return

    const lngLat = event.lngLat || event.target.getLngLat()

    if (lngLat) {
      dispatch("markerPlacement", { lngLat })
    } else {
      console.error("Invalid event format. Missing lngLat property.")
    }
  }

  function handleMouseDown(event) {
    if (!controlsEnabled) return

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
    if (!controlsEnabled) return

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
    if (!controlsEnabled) return

    isDragging = false
    clearTimeout(longPressTimer)
    longPressTimer = null
    longPressStartPosition = null
  }
</script>
