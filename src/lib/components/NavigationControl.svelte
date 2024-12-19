<script>
  import { onMount } from "svelte"
  import { getContext } from "svelte"
  import { browser } from "$app/environment"
  import mapboxgl from "mapbox-gl"

  let map
  let isTrackingUser = false
  let watchId = null
  let compassClicks = 0
  let clickTimeout = null

  const { getMap } = getContext("map")

  class CustomNavigationControl extends mapboxgl.NavigationControl {
    constructor(options) {
      super(options)
      this._trackingEnabled = false
    }

    onAdd(map) {
      const container = super.onAdd(map)

      // Find the compass button
      const compassButton = container.querySelector(".mapboxgl-ctrl-compass")
      if (compassButton) {
        // Override the default click handler
        compassButton.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()
          this._handleCompassClick(map)
        })
      }

      return container
    }

    _handleCompassClick(map) {
      if (clickTimeout) clearTimeout(clickTimeout)

      compassClicks++

      clickTimeout = setTimeout(() => {
        compassClicks = 0
      }, 500)

      if (compassClicks === 1) {
        // First click - reset bearing to north
        map.resetNorth()
        if (this._trackingEnabled) {
          this._disableTracking()
        }
      } else if (compassClicks === 2) {
        // Second click - toggle tracking
        compassClicks = 0
        this._toggleTracking(map)
      }
    }

    _toggleTracking(map) {
      this._trackingEnabled = !this._trackingEnabled

      const compassButton = document.querySelector(".mapboxgl-ctrl-compass")

      if (this._trackingEnabled && navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            map.easeTo({
              center: [position.coords.longitude, position.coords.latitude],
              bearing: position.coords.heading || 0,
              duration: 1000,
            })
          },
          null,
          { enableHighAccuracy: true },
        )

        if (compassButton) {
          compassButton.classList.add("tracking-active")
        }
      } else {
        this._disableTracking()
      }
    }

    _disableTracking() {
      this._trackingEnabled = false
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
      }

      const compassButton = document.querySelector(".mapboxgl-ctrl-compass")
      if (compassButton) {
        compassButton.classList.remove("tracking-active")
      }
    }
  }

  onMount(async () => {
    if (!browser) return

    try {
      map = await getMap()

      const nav = new CustomNavigationControl({
        showZoom: false,
        showCompass: true,
        visualizePitch: true,
      })

      map.addControl(nav, "bottom-right")
    } catch (err) {
      console.warn("Map initialization error:", err)
    }
  })
</script>

<style>
  /* Increase size of all mapbox controls */
  :global(.mapboxgl-ctrl-group > button) {
    width: 40px !important;
    height: 40px !important;
  }

  /* Adjust compass icon */
  :global(.mapboxgl-ctrl-compass .mapboxgl-ctrl-icon) {
    background-size: 20px !important;
  }

  /* Tracking active state */
  :global(.mapboxgl-ctrl-compass.tracking-active) {
    background-color: #e0e0e0 !important;
  }

  :global(.mapboxgl-ctrl-compass.tracking-active .mapboxgl-ctrl-icon) {
    background-color: #e0e0e0 !important;
  }

  :global(.mapboxgl-ctrl-group > button) {
    width: 60px !important;
    height: 60px !important;
  }

  :global(.mapboxgl-ctrl-compass .mapboxgl-ctrl-icon) {
    background-size: 44px !important;
  }

  :global(.mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon) {
    background-size: 44px !important;
  }
</style>
