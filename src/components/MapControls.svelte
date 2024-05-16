<!-- MapControls.svelte -->
<script>
  import { createEventDispatcher } from "svelte"

  export let map

  const dispatch = createEventDispatcher()

  let isDragging = false
  let longPressTimer = null
  let longPressOccurred = false
  let longPressStartPosition = null
  const longPressThreshold = 500
  const longPressMoveThreshold = 5

  function handleMarkerPlacement(event) {
    const lngLat = event.lngLat || event.target.getLngLat()

    if (lngLat) {
      dispatch("markerPlacement", { lngLat })
    } else {
      console.error("Invalid event format. Missing lngLat property.")
    }
  }

  function handleMapClick(event) {
    if (!isDragging && !longPressOccurred) {
      clearTimeout(longPressTimer)
      longPressTimer = null
      handleMarkerPlacement(event)
    }
    longPressOccurred = false
  }

  function handleMapDragStart(event) {
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

  function handleMapDragEnd(event) {
    isDragging = false
    clearTimeout(longPressTimer)
    longPressTimer = null
    longPressStartPosition = null
  }

  // Add event listeners when the component mounts
  map.on("click", handleMapClick)
  map.on("mousedown", handleMapDragStart)
  map.on("touchstart", handleMapDragStart)
  map.on("drag", handleMapDrag)
  map.on("dragend", handleMapDragEnd)
</script>
