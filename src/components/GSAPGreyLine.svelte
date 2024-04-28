<script>
  import { onMount } from "svelte"
  import { gsap } from "gsap"
  import { MotionPathPlugin } from "gsap/MotionPathPlugin"

  let animationContainer
  let animationSvg
  let brushStrokeWidth
  let timeline
  let farmData = []
  let minLon, maxLon, minLat, maxLat, scaleX, scaleY
  let progress = 0
  let path
  let motionPath
  let sectionColors = {}
  let tractor
  let tractorAnimation
  let pathData = [] // Initialize pathData as an empty array
  let colorIndex = 0
  let isPlaying = false
  let pathLengths = []
  let totalDuration = 0
  let durationScalingFactor = 0.1

  gsap.registerPlugin(MotionPathPlugin)

  onMount(async () => {
    await loadData()
    const simplifiedData = simplifyPath(farmData, 0.000001) // Adjust the tolerance as needed
    console.log(`Original data points: ${farmData.length}`)
    console.log(`Simplified data points: ${simplifiedData.length}`)
    farmData = simplifiedData
    calculateScaleFactors()
    brushStrokeWidth = calculateBrushStrokeWidth()

    pathData = generatePathData() // Generate the path data and assign it to pathData
    preprocessPathData() // Call the preprocessing function after pathData is populated
    preprocessSectionColors() // Call the preprocessing function
    preprocessTractorAnimation() // Call the preprocessing function
    preprocessPathLengths() // Add this line to preprocess path lengths
    createCompletePath()
    animatePath()

    addEventListener("animationprogress", (event) => {
      progress = event.detail
    })
  })

  async function loadData() {
    const response = await fetch("/data/supershedseeding.geojson")
    const geojsonData = await response.json()
    farmData = geojsonData.features
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
    minLon = Math.min(
      ...farmData.map((feature) => feature.geometry.coordinates[0]),
    )
    maxLon = Math.max(
      ...farmData.map((feature) => feature.geometry.coordinates[0]),
    )
    minLat = Math.min(
      ...farmData.map((feature) => feature.geometry.coordinates[1]),
    )
    maxLat = Math.max(
      ...farmData.map((feature) => feature.geometry.coordinates[1]),
    )

    scaleX = animationSvg.clientWidth / (maxLon - minLon)
    scaleY = animationSvg.clientHeight / (maxLat - minLat)
  }

  function handleSliderInput() {
    if (timeline) {
      timeline.pause()
      timeline.progress(progress)
    }
  }

  function handleSliderStart() {
    if (timeline) {
      timeline.pause()
    }
  }

  function handleSliderEnd() {
    if (timeline) {
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

  function animatePath() {
    const completePath = createCompletePath()

    timeline = gsap.timeline({
      onUpdate: () => {
        progress = timeline.progress()
        dispatchEvent(
          new CustomEvent("animationprogress", { detail: progress }),
        )
      },
    })
    progress = 0

    const drawLength = completePath.getTotalLength()

    timeline.fromTo(
      completePath,
      {
        strokeDasharray: drawLength + " " + drawLength,
        strokeDashoffset: drawLength,
      },
      {
        strokeDashoffset: 0,
        duration: 10,
        ease: "linear",
      },
    )

    animationSvg.appendChild(tractor)

    timeline.to(
      tractorAnimation,
      {
        progress: 1,
        ease: "linear",
        duration: 10,
      },
      0,
    )
  }

  function createLineAnimation(
    startIndex,
    endIndex,
    duration,
    cumulativeDuration,
  ) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")

    line.setAttribute("x1", pathData[startIndex].x)
    line.setAttribute("y1", pathData[startIndex].y)
    line.setAttribute("x2", pathData[startIndex].x)
    line.setAttribute("y2", pathData[startIndex].y)

    const sectionId =
      farmData[endIndex].properties && farmData[endIndex].properties.SECTIONID
    const color = sectionId ? sectionColors[sectionId] : "black"
    line.setAttribute("stroke", color)
    line.setAttribute("stroke-width", brushStrokeWidth)
    // line.setAttribute("stroke-linecap", "round")
    // line.setAttribute("stroke-linejoin", "round")

    animationSvg.appendChild(line)

    timeline.to(
      line,
      {
        duration: duration,
        attr: { x2: pathData[endIndex].x, y2: pathData[endIndex].y },
        ease: "linear",
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
    completePath.setAttribute("stroke-width", brushStrokeWidth)
    completePath.setAttribute("stroke-linecap", "round")
    completePath.setAttribute("stroke-linejoin", "round")
    completePath.setAttribute("opacity", 0.3)
    animationSvg.appendChild(completePath)

    return completePath
  }

  function togglePlayPause() {
    if (isPlaying) {
      timeline.pause()
    } else {
      timeline.play()
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

<div class="container">
  <div class="content-wrapper">
    <div class="animation-wrapper">
      <div id="animation-container" bind:this={animationContainer}>
        <svg
          id="animation-svg"
          bind:this={animationSvg}
          width="100%"
          height="100%"
        >
          ></svg
        >
      </div>
    </div>
    <div class="controls">
      <button on:click={togglePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
      <button on:click={moveBackward}>Backward</button>
      <button on:click={moveForward}>Forward</button>
      <input
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
</div>

<style>
  .container {
    display: flex;
    justify-content: left;
    align-items: left;
    width: 100%;
    height: 100%;
  }

  .content-wrapper {
    width: 75%;
  }

  .animation-wrapper {
    width: 100%;
    padding-bottom: 75%; /* Maintain 4:3 aspect ratio */
    position: relative;
  }

  #animation-container {
    border: 2px solid black;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .controls {
    border: 2px solid black;
    padding: 10px;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    margin-top: -1px;
  }
</style>
