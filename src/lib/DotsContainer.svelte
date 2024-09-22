<!-- src/lib/DotsContainer.svelte -->
<script lang="ts">
  import { Check, X } from "lucide-svelte"

  export let maps: Array<{
    title: string
    status: null | "accepted" | "rejected"
  }>
  export let currentIndex: number

  // Define maximum dots per row
  const MAX_DOTS_PER_ROW = 10

  // Split maps into chunks of MAX_DOTS_PER_ROW
  $: dotRows = []
  for (let i = 0; i < maps.length; i += MAX_DOTS_PER_ROW) {
    dotRows.push(maps.slice(i, i + MAX_DOTS_PER_ROW))
  }
</script>

<div class="dots-container">
  {#each dotRows as row, rowIndex (rowIndex)}
    <div class="dot-row">
      {#each row as map, index}
        <div
          class="dot
              {rowIndex * MAX_DOTS_PER_ROW + index === currentIndex
            ? 'active'
            : 'inactive'} 
              {map.status === 'accepted' ? 'accepted' : ''} 
              {map.status === 'rejected' ? 'rejected' : ''}"
          on:click={() => {
            // Emit an event or handle click to navigate to the selected map
            // This requires you to pass a handler as a prop or use a store
            // For simplicity, we'll use a custom event
            const event = new CustomEvent("dotClick", {
              detail: rowIndex * MAX_DOTS_PER_ROW + index,
            })
            dispatchEvent(event)
          }}
        >
          {#if map.status === "accepted"}
            <Check class="h-3 w-3 text-white" />
          {:else if map.status === "rejected"}
            <X class="h-3 w-3 text-white" />
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .dots-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px; /* Space between rows */
  }

  .dot-row {
    display: flex;
    flex-wrap: nowrap;
    gap: 4px; /* Space between dots */
  }

  .dot {
    flex: 0 0 auto;
    height: 1rem;
    width: 1rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      background-color 0.3s,
      border 0.3s;
  }

  .dot.active {
    background-color: #e5e7eb; /* bg-green-200 equivalent */
    border: 2px solid #374151; /* outline-black-500 equivalent */
  }

  .dot.inactive {
    background-color: #f3f4f6; /* bg-muted equivalent */
  }

  .dot.accepted {
    background-color: #4ade80; /* green-500 equivalent */
  }

  .dot.rejected {
    background-color: #f87171; /* red-500 equivalent */
  }
</style>
