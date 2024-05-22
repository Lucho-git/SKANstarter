<!-- MapControls.svelte -->
<script>
  import { createEventDispatcher } from "svelte"
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

  confirmedMarkersStore.subscribe((markers) => {
    // Add event listeners to new markers
    markers.forEach(({ marker }) => {
      const markerElement = marker.getElement()

      // Check if the marker already has event listeners
      if (!markerElement.hasAttribute("data-listeners-added")) {
        markerElement.addEventListener("mouseenter", handleMarkerMouseEnter)
        markerElement.addEventListener("mouseleave", handleMarkerMouseLeave)
        markerElement.addEventListener("click", handleMarkerClick)
        markerElement.setAttribute("data-listeners-added", "true")
      }
    })

    confirmedMarkers = markers
  })

  function handleMarkerMouseEnter(event) {
    const markerElement = event.target
    markerElement.style.cursor = "pointer"
  }

  function handleMarkerMouseLeave(event) {
    const markerElement = event.target
    markerElement.style.cursor = ""
  }

  function handleMarkerClick(event) {
    event.stopPropagation() // Stop the event from bubbling up to the map click event handler
    const markerElement = event.target.closest(".mapboxgl-marker")

    if (markerElement) {
      const { marker, id } = confirmedMarkers.find(
        (m) => m.marker.getElement() === markerElement,
      )

      if (marker) {
        dispatch("markerClick", { marker, id })
      }
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

  // Add event listeners when the component mounts
  //   map.on("click", handleMapClick)
  map.on("mousedown", handleMouseDown)
  map.on("touchstart", handleMouseDown)
  map.on("drag", handleMapDrag)
  map.on("mouseup", handleMouseUp)
</script>
