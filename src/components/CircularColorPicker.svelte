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
      <div class="color-wheel">
        {#each colors as color, index}
          <div
            class="color-option"
            style="
              background-color: {color}; 
              transform: rotate({index *
              30}deg) translate(100px) rotate(-{index * 30}deg);
            "
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
    border-radius: 50%;
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
  .color-wheel {
    position: relative;
    width: 250px;
    height: 250px;
    background-color: white;
    border-radius: 50%;
  }
  .color-option {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    top: 50%;
    left: 50%;
    margin: -20px;
  }
</style>
