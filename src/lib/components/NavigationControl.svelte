<script>
  import { onMount } from "svelte"
  import { getContext } from "svelte"
  import { browser } from "$app/environment"

  let map
  let isTrackingUser = false
  let watchId = null

  const { getMap } = getContext("map")

  function toggleTracking() {
    if (!browser || !map) return

    isTrackingUser = !isTrackingUser

    if (isTrackingUser && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          map?.easeTo({
            center: [position.coords.longitude, position.coords.latitude],
            bearing: position.coords.heading || 0,
            duration: 1000,
          })
        },
        null,
        { enableHighAccuracy: true },
      )
    } else if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
  }

  // Only run this in the browser, not during SSR
  $: if (browser && map) {
    const control = new DynamicControl()
    map.addControl(control, "bottom-left")
  }

  class DynamicControl {
    onAdd() {
      // Create elements only when running in browser
      if (!browser) return null

      const container = document.createElement("div")
      const button = document.createElement("button")

      container.className = "mapboxgl-ctrl mapboxgl-ctrl-group"
      button.className = "tracking-toggle mapboxgl-ctrl-icon"
      button.innerHTML = "🎯"
      button.addEventListener("click", toggleTracking)

      if (isTrackingUser) {
        button.classList.add("active")
      }

      container.appendChild(button)
      return container
    }
  }

  onMount(async () => {
    if (!browser) return

    try {
      map = await getMap()
    } catch (err) {
      console.warn("Map initialization error:", err)
    }
  })
</script>

<style>
  :global(.tracking-toggle) {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.tracking-toggle.active) {
    background: #ccc;
  }
</style>
