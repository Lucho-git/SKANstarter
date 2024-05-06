<script>
  import { onMount } from "svelte"

  let timeData = []
  let cropData = []
  let appliedRateData = []
  let swathWidthData = []
  let headingData = []
  let targetRateData = []
  let varietyData = []
  let machineData = []
  let fuelData = []
  let vehicleSpeedData = []

  let animationContainer
  let animationSvg
  let brushStrokeWidth
  let timeline
  let farmData = []
  let paddockBoundary = []
  let minLon, maxLon, minLat, maxLat, scaleX, scaleY
  let progress = 0
  let path
  let motionPath
  let sectionColors = {}
  let tractor
  let tractorAnimation
  let pathData = [] // Initialize pathData as an empty array
  let colorIndex = 0
  let isPlaying = true // Set initial state to playing
  let buttonState = "Pause" // Set initial button text to "Pause"
  let pathLengths = []
  let totalDuration = 0
  let durationScalingFactor = 0.1
  let scale = 1
  const zoomFactor = 0.1

  onMount(async () => {
    gsap.registerPlugin(MotionPathPlugin)

    await loadData()
    await loadPaddockBoundary()
    const simplifiedData = simplifyPath(farmData, 0.000005) // Cut down the number of values we process based on a tolerance value
    console.log(`Original data points: ${farmData.length}`)
    console.log(`Simplified data points: ${simplifiedData.length}`)
    farmData = simplifiedData
    // Record the additional data for the simplified path
    timeData = farmData.map((feature) => feature.properties.Time)
    cropData = farmData.map((feature) => feature.properties.Crop)
    appliedRateData = farmData.map((feature) => feature.properties.AppliedRate)
    swathWidthData = farmData.map((feature) => feature.properties.SWATHWIDTH)
    headingData = farmData.map((feature) => feature.properties.Heading)
    targetRateData = farmData.map((feature) => feature.properties.TargetRate)
    varietyData = farmData.map((feature) => feature.properties.Variety)
    machineData = farmData.map((feature) => feature.properties.Machine)
    fuelData = farmData.map((feature) => feature.properties.FUEL)
    vehicleSpeedData = farmData.map((feature) => feature.properties.VEHICLSPEED)

    calculateScaleFactors()
    brushStrokeWidth = calculateBrushStrokeWidth()

    pathData = generatePathData() // Generate the path data and assign it to pathData
    preprocessPathData() // Call the preprocessing function after pathData is populated
    preprocessSectionColors() // Call the preprocessing function
    preprocessTractorAnimation() // Call the preprocessing function
    preprocessPathLengths() // Add this line to preprocess path lengths
    createCompletePath()
    console.log("About to draw paddock boundary")

    drawPaddockBoundary()
    console.log("Drawn paddock boundary")
    animatePath()

    animationContainer.addEventListener("wheel", handleWheel)
    addEventListener("animationprogress", (event) => {
      progress = event.detail
    })
  })

  async function loadData() {
    const response = await fetch("/data/supershedseeding.geojson")
    const geojsonData = await response.json()
    farmData = geojsonData.features
  }

  async function loadPaddockBoundary() {
    const response = await fetch("/data/supershedboundary.geojson")
    const geojsonData = await response.json()
    paddockBoundary = geojsonData.features[0].geometry.coordinates[0][0]
    console.log(paddockBoundary)
  }

  function handleWheel(event) {
    event.preventDefault()
    const delta = event.deltaY < 0 ? 1 : -1
    scale += delta * zoomFactor
    scale = Math.max(0.5, Math.min(scale, 2)) // Limit the scale between 0.5 and 2
    animationSvg.style.transform = `scale(${scale})`
  }

  function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  function preprocessPathLengths() {
    pathLengths = []
    totalDuration = 0

    for (let i = 1; i < pathData.length; i++) {
      const startPoint = pathData[i - 1]
      const endPoint = pathData[i]
      const distance = calculateDistance(startPoint, endPoint)
      pathLengths.push(distance)
      totalDuration += distance
    }

    totalDuration *= durationScalingFactor
  }

  function simplifyPath(data, tolerance) {
    const points = data.map((feature) => ({
      x: feature.geometry.coordinates[0],
      y: feature.geometry.coordinates[1],
    }))

    if (points.length <= 2) {
      return data
    }

    let dmax = 0
    let index = 0

    for (let i = 1; i < points.length - 1; i++) {
      const d = perpendicularDistance(
        points[i],
        points[0],
        points[points.length - 1],
      )
      if (d > dmax) {
        index = i
        dmax = d
      }
    }

    if (dmax > tolerance) {
      const results1 = simplifyPath(data.slice(0, index + 1), tolerance)
      const results2 = simplifyPath(data.slice(index), tolerance)
      return [...results1.slice(0, -1), ...results2]
    } else {
      return [data[0], data[data.length - 1]]
    }
  }

  function perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x
    const dy = lineEnd.y - lineStart.y
    const numerator = Math.abs(
      dy * point.x -
        dx * point.y +
        lineEnd.x * lineStart.y -
        lineEnd.y * lineStart.x,
    )
    const denominator = Math.sqrt(dx * dx + dy * dy)
    return numerator / denominator
  }

  function preprocessPathData() {
    path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("fill", "none")
    path.setAttribute("stroke", "transparent")
    path.setAttribute("stroke-width", brushStrokeWidth)
    path.setAttribute(
      "d",
      `M${pathData.map((point) => `${point.x},${point.y}`).join("L")}`,
    )
    animationSvg.appendChild(path)

    motionPath = {
      path: path,
      autoRotate: true,
      align: path,
      alignOrigin: [0.5, 0.5],
      start: 0,
      end: 1,
    }
  }

  function preprocessSectionColors() {
    const availableColors = [
      "red",
      "blue",
      "green",
      "orange",
      "purple",
      "cyan",
      "magenta",
      "teal",
      "brown",
      "lime",
    ]

    farmData.forEach((data, index) => {
      const sectionId = data.properties && data.properties.SECTIONID
      if (sectionId && !sectionColors[sectionId]) {
        sectionColors[sectionId] =
          availableColors.length > 0
            ? availableColors[colorIndex % availableColors.length]
            : `hsl(${Math.random() * 360}, 50%, 50%)`

        colorIndex++
      }
    })
  }

  function preprocessTractorAnimation() {
    tractor = document.createElementNS("http://www.w3.org/2000/svg", "image")
    tractor.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      "/images/tractor.svg",
    )
    tractor.setAttribute("width", brushStrokeWidth * 4)
    tractor.setAttribute("height", brushStrokeWidth * 4)

    tractorAnimation = gsap.to(tractor, {
      motionPath: motionPath,
      duration: 1,
      ease: "linear",
      paused: true,
    })
  }

  function calculateScaleFactors() {
    minLon = Math.min(...paddockBoundary.map((coord) => coord[0]))
    maxLon = Math.max(...paddockBoundary.map((coord) => coord[0]))
    minLat = Math.min(...paddockBoundary.map((coord) => coord[1]))
    maxLat = Math.max(...paddockBoundary.map((coord) => coord[1]))

    scaleX = animationSvg.clientWidth / (maxLon - minLon)
    scaleY = animationSvg.clientHeight / (maxLat - minLat)
  }

  function handleSliderInput() {
    if (timeline) {
      timeline.pause()
      timeline.progress(progress)
      if (progress === 1) {
        isPlaying = false
        buttonState = "Restart"
      } else {
        isPlaying = true
        buttonState = "Pause"
      }
    }
  }

  function handleSliderStart() {
    if (timeline) {
      timeline.pause()
    }
  }

  function handleSliderEnd() {
    if (timeline && progress !== 1) {
      timeline.resume()
    }
  }

  function calculateBrushStrokeWidth() {
    const earthRadius = 6371000 // Earth's radius in meters
    const lonDiff = (maxLon - minLon) * (Math.PI / 180)
    const latDiff = (maxLat - minLat) * (Math.PI / 180)
    const a =
      Math.sin(latDiff / 2) ** 2 +
      Math.cos(minLat * (Math.PI / 180)) *
        Math.cos(maxLat * (Math.PI / 180)) *
        Math.sin(lonDiff / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = earthRadius * c
    const pixelsPerMeter = animationSvg.clientWidth / distance
    return 12 * pixelsPerMeter
  }

  function generatePathData() {
    const pathData = []

    for (let i = 0; i < farmData.length; i++) {
      const {
        geometry: {
          coordinates: [lon, lat],
        },
      } = farmData[i]

      const x = (lon - minLon) * scaleX
      const y = animationSvg.clientHeight - (lat - minLat) * scaleY

      pathData.push({ x, y })
    }

    return pathData
  }

  function drawPaddockBoundary() {
    console.log("Drawing paddock boundary")
    const paddockPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    )

    const pathData = paddockBoundary
      .map(
        (coord) =>
          `${(coord[0] - minLon) * scaleX},${
            animationSvg.clientHeight - (coord[1] - minLat) * scaleY
          }`,
      )
      .join("L")

    paddockPath.setAttribute("d", `M${pathData}Z`)
    paddockPath.setAttribute("fill", "none")
    paddockPath.setAttribute("stroke", "black")
    paddockPath.setAttribute("stroke-width", 2)

    animationSvg.appendChild(paddockPath)
  }

  function updateDisplayedData(featureIndex) {
    // Update the displayed data based on the current feature index
    const timeValue = timeData[featureIndex]
    const [date, hours] = timeValue.split(" ")
    document.getElementById("date").textContent = date
    document.getElementById("hours").textContent = hours

    document.getElementById("crop").textContent = cropData[featureIndex]
    document.getElementById("appliedRate").textContent =
      appliedRateData[featureIndex]
    document.getElementById("swathWidth").textContent =
      swathWidthData[featureIndex]

    const headingValue = headingData[featureIndex]
    document.getElementById("heading").textContent = headingValue.toFixed(2)

    document.getElementById("targetRate").textContent =
      targetRateData[featureIndex]
    document.getElementById("variety").textContent = varietyData[featureIndex]
    document.getElementById("machine").textContent = machineData[featureIndex]

    const fuelValue = fuelData[featureIndex]
    document.getElementById("fuel").textContent = fuelValue.toFixed(4)

    const vehicleSpeedValue = vehicleSpeedData[featureIndex]
    document.getElementById("vehicleSpeed").textContent =
      vehicleSpeedValue.toFixed(2)
  }

  let currentFeatureIndex = 0

  function animatePath() {
    timeline = gsap.timeline({
      onUpdate: () => {
        progress = timeline.progress()
        dispatchEvent(
          new CustomEvent("animationprogress", { detail: progress }),
        )
        // Update the current feature index based on the animation progress
        const featureIndex = Math.floor(progress * (pathData.length - 1))
        if (featureIndex !== currentFeatureIndex) {
          currentFeatureIndex = featureIndex
          updateDisplayedData(currentFeatureIndex)
        }
      },
    })
    progress = 0

    // Clear the existing timeline
    timeline.clear()

    let cumulativeDuration = 0

    for (let i = 1; i < pathData.length; i++) {
      const startIndex = i - 1
      const endIndex = i
      const duration = (pathLengths[i - 1] / totalDuration) * 10

      createPathAnimation(startIndex, endIndex, duration, cumulativeDuration)
      cumulativeDuration += duration
    }

    // Re-append the tractor to the animation SVG
    animationSvg.appendChild(tractor)

    // Update the existing tractor animation to match the new timeline
    tractorAnimation.duration(cumulativeDuration)
    tractorAnimation.restart()

    timeline.add(tractorAnimation, 0)

    timeline.eventCallback("onComplete", () => {
      isPlaying = false
      buttonState = "Restart"
    })
  }

  function createPathAnimation(
    startIndex,
    endIndex,
    duration,
    cumulativeDuration,
  ) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

    const startPoint = pathData[startIndex]
    const endPoint = pathData[endIndex]

    const midPoint = {
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2,
    }

    const controlPoint1 = {
      x: (startPoint.x + midPoint.x) / 2,
      y: (startPoint.y + midPoint.y) / 2,
    }
    const controlPoint2 = {
      x: (midPoint.x + endPoint.x) / 2,
      y: (midPoint.y + endPoint.y) / 2,
    }

    const pathDefinition = `M${startPoint.x},${startPoint.y} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${endPoint.x},${endPoint.y}`
    path.setAttribute("d", pathDefinition)

    const sectionId =
      farmData[endIndex].properties && farmData[endIndex].properties.SECTIONID
    const color = sectionId ? sectionColors[sectionId] : "black"
    path.setAttribute("stroke", color)
    path.setAttribute("fill", "none")
    path.setAttribute("stroke-width", brushStrokeWidth)
    path.setAttribute("stroke-linecap", "round")
    path.setAttribute("stroke-linejoin", "round")
    path.style.opacity = 0
    animationSvg.appendChild(path)

    const drawLength = path.getTotalLength()

    timeline.fromTo(
      path,
      {
        strokeDasharray: drawLength + " " + drawLength,
        strokeDashoffset: drawLength,
      },
      {
        strokeDashoffset: 0,
        duration: duration,
        ease: "linear",
        onUpdate: () => {
          const progress = timeline.progress()
          path.style.opacity =
            progress >= cumulativeDuration / timeline.duration() ? 1 : 0
        },
      },
      cumulativeDuration,
    )
  }

  function createCompletePath() {
    const completePath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    )

    const pathDefinition = `M${pathData[0].x},${pathData[0].y} ${pathData
      .slice(1)
      .map((point) => `L${point.x},${point.y}`)
      .join(" ")}`
    completePath.setAttribute("d", pathDefinition)

    completePath.setAttribute("stroke", "black")
    completePath.setAttribute("fill", "none")
    completePath.setAttribute("stroke-width", brushStrokeWidth * 0.05) // Adjust the width as needed
    completePath.setAttribute("stroke-linecap", "round")
    completePath.setAttribute("stroke-linejoin", "round")
    completePath.setAttribute("opacity", 0.3) // Adjust the opacity as needed
    animationSvg.appendChild(completePath)
  }

  function togglePlayPause() {
    if (isPlaying) {
      timeline.pause()
      buttonState = "Play"
    } else {
      if (timeline.progress() === 1) {
        // Clear the existing path and tractor
        animationSvg.innerHTML = ""
        // Redraw the complete path
        createCompletePath()
        updateDisplayedData(0) // Reset the displayed data to the first feature
        // Restart the combined animation from the beginning

        animatePath()
      } else {
        timeline.play()
      }
      buttonState = "Pause"
    }
    isPlaying = !isPlaying
  }

  function play() {
    timeline.play()
  }

  function pause() {
    timeline.pause()
  }

  function moveForward() {
    timeline.progress(timeline.progress() + 0.1) // Adjust the progress increment as needed
  }

  function moveBackward() {
    timeline.progress(timeline.progress() - 0.1) // Adjust the progress decrement as needed
  }

  function clearAnimation() {
    timeline.clear()
    animationSvg.innerHTML = ""
    progress = 0
  }
</script>

<div class="full-width mx-auto">
  <div class="flex flex-row">
    <div class="w-5/6 flex flex-col">
      <!-- Animation container -->
      <div class="animation-wrapper flex-grow">
        <div id="animation-container" bind:this={animationContainer}>
          <svg
            id="animation-svg"
            bind:this={animationSvg}
            width="100%"
            height="100%"
          ></svg>
        </div>
      </div>
      <!-- Controls section -->
      <div class="controls mt-4">
        <button on:click={moveBackward}>↺</button>

        <button
          class="play-pause-restart ml-2 mr-2"
          data-state={buttonState.toLowerCase()}
          on:click={togglePlayPause}
        ></button>
        <button on:click={moveForward}>↻</button>

        <input
          class="ml-2"
          type="range"
          min="0"
          max="1"
          step="0.001"
          bind:value={progress}
          on:input={handleSliderInput}
          on:mousedown={handleSliderStart}
          on:touchstart={handleSliderStart}
          on:mouseup={handleSliderEnd}
          on:touchend={handleSliderEnd}
          on:mouseleave={handleSliderEnd}
        />
      </div>
    </div>
    <div
      class="hidden md:block md:w-1/6 mt-8 md:mt-0 flex flex-col relative min-w-[160px] max-w-[200px]"
    >
      <!-- Data display column -->
      <div
        class="card bg-base-100 rounded-none flex-grow overflow-y-auto border-2 border-black h-full -mb-1"
      >
        <div class="card-body p-4">
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="font-bold text-sm">Time</span>
            </div>
            <div id="time" class="text-sm">
              <div class="badge badge-outline" id="date"></div>
              <br />
              <div class="badge badge-outline" id="hours"></div>
            </div>
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span class="font-bold text-sm">Crop</span>
            </div>
            <div class="badge badge-outline" id="crop"></div>
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span class="font-bold text-sm">Applied Rate</span>
            </div>
            <div class="badge badge-outline" id="appliedRate"></div>
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span class="font-bold text-sm">Swath Width</span>
            </div>
            <div class="badge badge-outline" id="swathWidth"></div>
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span class="font-bold text-sm">Heading</span>
            </div>
            <div class="badge badge-outline" id="heading"></div>
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span class="font-bold text-sm">Target Rate</span>
            </div>
            <div class="badge badge-outline" id="targetRate"></div>
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
              <span class="font-bold text-sm">Variety</span>
            </div>
            <div class="badge badge-outline" id="variety"></div>
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span class="font-bold text-sm">Machine</span>
            </div>
            <div class="badge badge-outline" id="machine"></div>
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                />
              </svg>
              <span class="font-bold text-sm">Fuel</span>
            </div>
            <div class="badge badge-outline" id="fuel"></div>
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span class="font-bold text-sm">Vehicle Speed</span>
            </div>
            <div class="badge badge-outline" id="vehicleSpeed"></div>
          </div>
        </div>
      </div>
      <div class="border-t-2 border-black"></div>
    </div>
  </div>
</div>

<style>
  .animation-wrapper {
    width: 100%;
    height: 0;
    padding-bottom: 66.67%; /* Maintain 3:2 aspect ratio */
    position: relative;
    overflow: hidden;
  }

  #animation-container {
    border: 2px solid black;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: top left;
    transition: transform 0.3s ease;
  }

  .controls {
    border: 2px solid black;
    padding: 10px;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    margin-top: -1px;
  }

  .play-pause-restart[data-state="play"]::before {
    content: "▶️"; /* Play symbol */
  }

  .play-pause-restart[data-state="pause"]::before {
    content: "⏸"; /* Pause symbol */
  }

  .play-pause-restart[data-state="restart"]::before {
    content: "🔁"; /* Restart symbol */
  }

  .relative::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: black;
  }

  .full-width {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 90vh;
    /* border: 2px solid red; Add a red border to visualize the parent container */
  }
</style>
