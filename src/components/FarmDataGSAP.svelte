<script>
  import { onMount } from "svelte"
  import { gsap } from "gsap"

  let animationContainer
  let animationSvg
  let timeline
  let farmData = []
  let minLon, maxLon, minLat, maxLat, scaleX, scaleY
  let progress = 0

  onMount(async () => {
    await loadData()
    calculateScaleFactors()
    animatePath()
  })

  async function loadData() {
    const response = await fetch("/data/supershedseeding.geojson")
    const geojsonData = await response.json()
    farmData = geojsonData.features
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
    timeline.progress(progress)
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
      const currentPoint = farmData[i].geometry.coordinates

      const currentX = (currentPoint[0] - minLon) * scaleX
      const currentY =
        animationSvg.clientHeight - (currentPoint[1] - minLat) * scaleY

      pathData.push({ x: currentX, y: currentY })
    }

    return pathData
  }

  const sectionColors = {}

  function getColorForSectionId(sectionId) {
    if (sectionColors[sectionId]) {
      return sectionColors[sectionId]
    }

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

    let color

    if (availableColors.length > 0) {
      color = availableColors[sectionId % availableColors.length]
    } else {
      color = `hsl(${Math.random() * 360}, 50%, 50%)`
    }

    sectionColors[sectionId] = color
    return color
  }

  function animatePath() {
    const pathData = generatePathData()
    const brushStrokeWidth = calculateBrushStrokeWidth()

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("fill", "none")
    path.setAttribute("stroke", "black")
    path.setAttribute("stroke-width", brushStrokeWidth)
    animationSvg.appendChild(path)

    const drawLine = (startIndex, endIndex, duration) => {
      const startPoint = pathData[startIndex]
      const endPoint = pathData[endIndex]

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      )
      line.setAttribute("x1", startPoint.x)
      line.setAttribute("y1", startPoint.y)
      line.setAttribute("x2", startPoint.x)
      line.setAttribute("y2", startPoint.y)
      if (
        farmData[endIndex] &&
        farmData[endIndex].properties &&
        farmData[endIndex].properties.SECTIONID
      ) {
        line.setAttribute(
          "stroke",
          getColorForSectionId(farmData[endIndex].properties.SECTIONID),
        )
      } else {
        line.setAttribute("stroke", "black") // Default color if SECTIONID is missing
      }

      line.setAttribute("stroke-width", brushStrokeWidth)
      animationSvg.appendChild(line)

      timeline.to(line, {
        duration: duration,
        attr: { x2: endPoint.x, y2: endPoint.y },
        ease: "linear",
      })
    }

    timeline = gsap.timeline()
    progress = 0 // Set progress to 0 when the animation starts

    for (let i = 0; i < pathData.length - 1; i++) {
      const startIndex = i
      const endIndex = i + 1
      const duration = 0.00015 // Adjust the duration as needed
      drawLine(startIndex, endIndex, duration)
    }
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

  function updateProgress() {
    progress = timeline.progress()
  }
</script>

<div id="animation-container" bind:this={animationContainer}>
  <svg id="animation-svg" bind:this={animationSvg} width="1120" height="840"
  ></svg>
</div>

<div class="controls">
  <button on:click={moveBackward}>Backward</button>
  <button on:click={play}>Play</button>
  <button on:click={pause}>Pause</button>
  <button on:click={moveForward}>Forward</button>
  <button on:click={clearAnimation}>Clear</button>
  <input
    type="range"
    min="0"
    max="1"
    step="0.001"
    bind:value={progress}
    on:input={handleSliderInput}
  />
</div>

<style>
  #animation-container {
    border: 2px solid black;
    display: inline-block;
  }

  .controls {
    margin-top: 10px;
  }
</style>
