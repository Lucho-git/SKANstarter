<!-- StubContainer.svelte -->
<script lang="ts">
  import { onMount } from "svelte"

  let animationSvg: SVGSVGElement

  onMount(() => {
    console.log("Animation container mounted")
  })
</script>

<div class="container">
  <div class="animation-wrapper">
    <div id="animation-container">
      <svg id="animation-svg" bind:this={animationSvg} viewBox="0 0 1120 840">
        <!-- Add your SVG content here -->
        <rect x="0" y="0" width="100%" height="100%" fill="#f0f0f0" />
        <circle cx="50%" cy="50%" r="200" fill="#ff0000" />
        <text
          x="50%"
          y="50%"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="48"
          fill="#ffffff"
        >
          Animation Container
        </text>
      </svg>
    </div>
  </div>

  <div class="controls">
    <button>Start</button>
    <button>Stop</button>
    <button>Reset</button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: left;
    width: 100%;
    height: 100%;
  }

  .animation-wrapper {
    width: 75%;
    aspect-ratio: 4 / 3; /* Maintain 4:3 aspect ratio */
  }

  #animation-container {
    border: 2px solid black;
    width: 100%;
    height: 100%;
  }

  .controls {
    border: 2px solid black;
    padding: 10px;
    text-align: center;
    width: 75%;
    box-sizing: border-box;
    margin-top: -1px;
  }

  @media (max-width: 600px) {
    .animation-wrapper {
      width: 100%;
    }

    .controls {
      width: 100%;
    }
  }
</style>
