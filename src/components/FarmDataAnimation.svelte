<script>
  import { onMount } from "svelte"

  let canvasRef
  let animationFrameId
  let farmData = []
  let currentIndex = 0
  let isPlaying = false
  let speedFactor = 10 // Adjust this value to control the animation speed

  onMount(async () => {
    const response = await fetch("/data/supershedseeding.geojson")
    const geojsonData = await response.json()
    farmData = geojsonData.features
  })

  function getColorForSectionId(sectionId) {
    const colors = [
      "red",
      "blue",
      "orange",
      "purple",
      "cyan",
      "magenta",
      "teal",
      "brown",
    ]
    const index = sectionId % colors.length
    return colors[index]
  }

  function play() {
    isPlaying = true
    animate()
  }

  function pause() {
    isPlaying = false
    cancelAnimationFrame(animationFrameId)
  }

  function animate() {
    for (let i = 0; i < speedFactor; i++) {
      moveForward()
      if (currentIndex >= farmData.length - 1) {
        break
      }
    }
    if (isPlaying && currentIndex < farmData.length - 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      isPlaying = false
    }
  }

  function moveForward() {
    if (currentIndex < farmData.length - 1) {
      currentIndex++
      paintTrail()
    }
  }

  function moveBackward() {
    if (currentIndex > 0) {
      currentIndex--
      paintTrail()
    }
  }

  function paintTrail() {
    const canvas = canvasRef
    const ctx = canvas.getContext("2d")

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Find the minimum and maximum coordinates
    const minLon = Math.min(
      ...farmData.map((feature) => feature.geometry.coordinates[0]),
    )
    const maxLon = Math.max(
      ...farmData.map((feature) => feature.geometry.coordinates[0]),
    )
    const minLat = Math.min(
      ...farmData.map((feature) => feature.geometry.coordinates[1]),
    )
    const maxLat = Math.max(
      ...farmData.map((feature) => feature.geometry.coordinates[1]),
    )

    // Calculate the scale factors
    const scaleX = canvas.width / (maxLon - minLon)
    const scaleY = canvas.height / (maxLat - minLat)

    for (let i = 1; i <= currentIndex; i++) {
      const prevPoint = farmData[i - 1].geometry.coordinates
      const currentPoint = farmData[i].geometry.coordinates

      // Scale the coordinates to canvas pixels
      const prevX = (prevPoint[0] - minLon) * scaleX
      const prevY = canvas.height - (prevPoint[1] - minLat) * scaleY
      const currentX = (currentPoint[0] - minLon) * scaleX
      const currentY = canvas.height - (currentPoint[1] - minLat) * scaleY

      ctx.strokeStyle = getColorForSectionId(farmData[i].properties.SECTIONID)

      ctx.beginPath()
      ctx.moveTo(prevX, prevY)
      ctx.lineTo(currentX, currentY)
      ctx.stroke()
    }
  }

  function clearCanvas() {
    const canvas = canvasRef
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    currentIndex = 0
  }
</script>

<div class="canvas-container">
  <canvas bind:this={canvasRef} width={1120} height={840}></canvas>
</div>
<div class="controls">
  <button on:click={moveBackward} disabled={currentIndex === 0}>
    Backward
  </button>
  {#if isPlaying}
    <button on:click={pause}>Pause</button>
  {:else}
    <button on:click={play}>Play</button>
  {/if}
  <button
    on:click={moveForward}
    disabled={currentIndex === farmData.length - 1}
  >
    Forward
  </button>
  <button on:click={clearCanvas}>Clear</button>
</div>

<style>
  .canvas-container {
    border: 2px solid black;
    display: inline-block;
  }

  .controls {
    margin-top: 10px;
  }
</style>
