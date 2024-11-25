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
  let initialized = false

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

  function handleMarkerTouchStart(event) {
    if (!controlsEnabled) return

    // Prevent the map's touch events from firing
    event.stopPropagation()

    // Prevent default to stop unwanted behaviors
    event.preventDefault()

    // Clear any existing long press timer
    clearTimeout(longPressTimer)

    const markerElement = event.target.closest(".mapboxgl-marker")
    if (markerElement) {
      const foundMarker = confirmedMarkers.find(
        (m) => m.marker.getElement() === markerElement,
      )

      if (foundMarker) {
        const { marker, id } = foundMarker
        dispatch("markerClick", { marker, id })
      }
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

    // Check if the click/touch is on a marker
    const target = event.originalEvent.target
    if (target.closest(".mapboxgl-marker")) {
      return // Don't start long press if touching a marker
    }

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

  function updateMarkerListeners(marker, id) {
    const markerElement = marker.getElement()

    // Remove all existing listeners
    markerElement.removeEventListener("mouseenter", handleMarkerMouseEnter)
    markerElement.removeEventListener("mouseleave", handleMarkerMouseLeave)
    markerElement.removeEventListener("click", handleMarkerClick)
    markerElement.removeEventListener("touchstart", handleMarkerTouchStart)
    markerElement.removeAttribute("data-listeners-added")

    // Add listeners
    markerElement.addEventListener("mouseenter", handleMarkerMouseEnter)
    markerElement.addEventListener("mouseleave", handleMarkerMouseLeave)
    markerElement.addEventListener("click", handleMarkerClick)
    markerElement.addEventListener("touchstart", handleMarkerTouchStart)
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

  function initializeEventListeners() {
    if (!map || initialized) return

    map.on("mousedown", handleMouseDown)
    map.on("touchstart", handleMouseDown)
    map.on("drag", handleMapDrag)
    map.on("mouseup", handleMouseUp)

    document.addEventListener(
      "handleUpdateMarkerListeners",
      handleUpdateMarkerListeners,
    )

    initialized = true
  }

  function removeEventListeners() {
    if (!map || !initialized) return

    map.off("mousedown", handleMouseDown)
    map.off("touchstart", handleMouseDown)
    map.off("drag", handleMapDrag)
    map.off("mouseup", handleMouseUp)

    document.removeEventListener(
      "handleUpdateMarkerListeners",
      handleUpdateMarkerListeners,
    )

    initialized = false
  }

  // Watch for drawingModeEnabled changes
  $: {
    if ($drawingModeEnabled !== undefined) {
      controlsEnabled = !$drawingModeEnabled
      if (controlsEnabled && !initialized) {
        initializeEventListeners()
      } else if (!controlsEnabled && initialized) {
        removeEventListeners()
      }
    }
  }

  onMount(() => {
    if (controlsEnabled && !initialized) {
      initializeEventListeners()
    }
  })

  onDestroy(() => {
    if (confirmedMarkersUnsubscribe) {
      confirmedMarkersUnsubscribe()
    }
    removeEventListeners()
  })
</script>
