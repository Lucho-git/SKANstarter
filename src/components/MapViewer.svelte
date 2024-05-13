<script>
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"
  import "mapbox-gl/dist/mapbox-gl.css"
  import { debounce } from "lodash-es"

  let mapContainer
  let map
  let isSatelliteStyle = true
  let userMarker

  onMount(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoibHVjaG9kb3JlIiwiYSI6ImNsdndpd2NvNjA5OWUybG14anc1aWJpbXMifQ.7DSbOP9x-3sTZdJ5ee4UKw"

    map = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [0, 0],
      zoom: 2,
    })

    // Add the GeolocateControl to the map
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
      showUserLocation: false,
    })
    map.addControl(geolocateControl, "bottom-right")
    // Trigger the geolocate action when the map loads
    map.on("load", () => {
      geolocateControl.trigger()
    })

    // Create a custom user location marker
    userMarker = new mapboxgl.Marker({
      element: createUserMarkerElement(),
      pitchAlignment: "map",
      rotationAlignment: "map",
    })

    let currentRotation = 0
    let currentLat = 0
    let currentLng = 0

    const updateMarkerPosition = debounce((coords) => {
      const { latitude, longitude, heading } = coords

      const targetLat = latitude
      const targetLng = longitude
      const targetRotation = heading

      const latDiff = targetLat - currentLat
      const lngDiff = targetLng - currentLng
      const rotationDiff = targetRotation - currentRotation

      const distanceThreshold = 0.00001 // Adjust this value as needed
      const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2)

      if (distance < distanceThreshold) {
        // If the distance is too small, skip the animation
        return
      }

      const duration = 1000 // Duration in milliseconds
      const steps = duration / 16 // Number of steps based on 60 FPS (16.67ms per frame)

      const latStep = latDiff / steps
      const lngStep = lngDiff / steps
      const rotationStep = rotationDiff / steps

      let currentStep = 0

      function animateMarker() {
        currentLat += latStep
        currentLng += lngStep
        currentRotation += rotationStep

        userMarker.setLngLat([currentLng, currentLat])

        const tractorIcon = userMarker
          .getElement()
          .querySelector(".tractor-icon")
        tractorIcon.style.transform = `rotate(${currentRotation}deg)`

        currentStep++

        if (currentStep < steps) {
          requestAnimationFrame(animateMarker)
        }
      }

      userMarker.setLngLat([currentLng, currentLat]).addTo(map)
      animateMarker()
    }, 1000)

    // Update the user location marker on geolocate event
    geolocateControl.on("geolocate", (e) => {
      const { coords } = e
      updateMarkerPosition(coords)
    })
  })

  function createUserMarkerElement() {
    const el = document.createElement("div")
    el.className = "tractor-marker"
    el.style.position = "relative"
    el.style.display = "inline-block"

    const tractorIcon = document.createElement("div")
    tractorIcon.className = "tractor-icon"
    tractorIcon.style.backgroundImage = "url('/images/HarvestorUp.png')"
    tractorIcon.style.backgroundSize = "contain"
    tractorIcon.style.backgroundRepeat = "no-repeat"
    tractorIcon.style.backgroundPosition = "center"
    tractorIcon.style.width = "60px"
    tractorIcon.style.height = "60px"
    tractorIcon.style.position = "relative"
    tractorIcon.style.zIndex = "1"
    tractorIcon.style.transformOrigin = "center"
    tractorIcon.style.transition = "transform 1s ease-out"

    const pulseCircle = document.createElement("div")
    pulseCircle.className = "pulse-circle animate-pulse"
    pulseCircle.style.width = "40px"
    pulseCircle.style.height = "40px"
    pulseCircle.style.borderRadius = "50%"
    pulseCircle.style.backgroundColor = "rgba(172, 172, 230, 0.8)"
    pulseCircle.style.boxShadow = "0 0 0 10px rgba(153, 165, 240, 0.8)"
    pulseCircle.style.position = "absolute"
    pulseCircle.style.top = "50%"
    pulseCircle.style.left = "50%"
    pulseCircle.style.transform = "translate(-50%, -50%)"

    el.appendChild(tractorIcon)
    el.appendChild(pulseCircle)

    return el
  }

  //   function createUserMarkerElement() {
  //     const el = document.createElement("div")
  //     el.className = "tractor-marker"
  //     el.style.width = "40px"
  //     el.style.height = "40px"
  //     el.innerHTML = `
  //   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  //   <g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
  //     <path d="M20 60 L35 60 L35 30 L75 30 L75 60 L90 60" />
  //     <circle cx="35" cy="70" r="10" />
  //     <circle cx="75" cy="70" r="10" />
  //     <path d="M35 60 L50 45 L75 60" />
  //     <path d="M50 30 L50 45" />
  //     <path d="M35 30 L35 20 L55 20 L55 30" />
  //   </g>
  // </svg>
  //   `
  //     return el
  //   }

  function toggleMapStyle() {
    if (isSatelliteStyle) {
      map.setStyle("mapbox://styles/mapbox/outdoors-v12")
    } else {
      map.setStyle("mapbox://styles/mapbox/satellite-streets-v12")
    }
    isSatelliteStyle = !isSatelliteStyle
  }
</script>

<div class="map-container" bind:this={mapContainer}>
  <button
    class="btn btn-circle btn-sm absolute top-4 right-4 z-10"
    on:click={toggleMapStyle}
  >
    {#if isSatelliteStyle}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clip-rule="evenodd"
        />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z"
          clip-rule="evenodd"
        />
      </svg>
    {/if}
  </button>
</div>

<style>
  .map-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
  }
</style>
