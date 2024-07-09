<script>
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  export let showPicker = false
  export let selectedColor = "#FF0000"

  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
  ]

  function selectColor(color) {
    selectedColor = color
    dispatch("colorSelected", color)
    showPicker = false
  }
</script>

<div class="color-picker-container">
  <div
    class="selected-color"
    on:click={() => (showPicker = true)}
    style="background-color: {selectedColor};"
  ></div>

  {#if showPicker}
    <div class="modal" on:click|self={() => (showPicker = false)}>
      <div class="color-scroll">
        {#each colors as color}
          <div
            class="color-option"
            style="background-color: {color};"
            on:click={() => selectColor(color)}
          ></div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .color-picker-container {
    position: relative;
  }
  .selected-color {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    cursor: pointer;
  }
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .color-scroll {
    display: flex;
    overflow-x: auto;
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 90%;
  }
  .color-option {
    flex: 0 0 auto;
    width: 60px;
    height: 60px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
  }
  .color-option:last-child {
    margin-right: 0;
  }
</style>
