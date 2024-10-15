<script>
  import { Check, Copy, Share2, UserPlus, Phone, Mail } from "lucide-svelte"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import Icon from "@iconify/svelte"
  import { toast } from "svelte-sonner"

  let copied = false

  function copyMapId() {
    if ($connectedMapStore.id) {
      navigator.clipboard.writeText($connectedMapStore.id)
      copied = true
      setTimeout(() => (copied = false), 2000)
      toast.success("Copied to Clipboard")
    }
  }

  function comingSoon() {
    toast.info("Coming soon")
  }
</script>

<!-- Invite Button -->
<label for="invite-modal" class="vibrant-button btn btn-circle btn-sm">
  <Icon icon="mdi:plus" width="24" height="24" />
</label>

<!-- Invite Modal -->
<input type="checkbox" id="invite-modal" class="modal-toggle" />
<div class="modal">
  <div class="vibrant-theme modal-box p-8">
    <h3 class="vibrant-text mb-6 text-center text-2xl font-bold">
      Join AgSKAN Map
    </h3>
    <div class="flex flex-col items-center">
      <div class="mb-6 rounded-full bg-[#F7DB5C] p-4">
        <Icon icon="mdi:account-group" class="h-16 w-16 text-[#232322]" />
      </div>
      <p class="vibrant-text mb-6 text-center">Share your AgSKAN ID:</p>
      <div class="form-control mb-6 w-full max-w-xs">
        <div class="input-group">
          <input
            type="text"
            class="vibrant-input input flex-grow text-[#232322]"
            value={$connectedMapStore.id}
            readonly
          />
          <button class="vibrant-button btn btn-square" on:click={copyMapId}>
            {#if copied}
              <Check class="h-5 w-5" />
            {:else}
              <Copy class="h-5 w-5" />
            {/if}
          </button>
        </div>
      </div>
      <p class="vibrant-text text-center text-sm opacity-80">
        Other users can join the map using this ID.
      </p>
    </div>
    <div class="modal-action mt-8">
      <div class="flex w-full justify-end">
        <div class="dropdown dropdown-end dropdown-top mr-2">
          <label tabindex="0" class="vibrant-button btn">
            <Share2 class="mr-2 h-5 w-5" />
            Share
          </label>
          <ul
            tabindex="0"
            class="menu dropdown-content rounded-box w-52 bg-base-100 p-2 shadow"
          >
            <li>
              <a on:click={comingSoon}><Phone class="h-5 w-5" /> Via Phone</a>
            </li>
            <li>
              <a on:click={comingSoon}><Mail class="h-5 w-5" /> Via Email</a>
            </li>
          </ul>
        </div>
        <label for="invite-modal" class="vibrant-button-outlined btn"
          >Close</label
        >
      </div>
    </div>
    <div class="icon absolute right-2 top-2">
      <Icon icon="mdi:leaf" width="24" height="24" />
    </div>
    <div class="icon absolute bottom-2 left-2">
      <Icon icon="mdi:nature" width="24" height="24" />
    </div>
  </div>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap");

  .vibrant-theme {
    font-family: "Poppins", sans-serif;
    background: #fefbf6;
    border: 3px solid #f7db5c;
    box-shadow: 0 6px 8px rgba(247, 219, 92, 0.2);
  }
  .vibrant-text {
    color: #232322;
  }
  .vibrant-button {
    background: #63a375;
    border: none;
    color: #fefbf6;
    transition: all 0.3s ease;
  }
  .vibrant-button:hover {
    background: #4a7c59;
  }
  .vibrant-button-outlined {
    background: transparent;
    border: 2px solid #63a375;
    color: #63a375;
    transition: all 0.3s ease;
  }
  .vibrant-button-outlined:hover {
    background: #63a375;
    color: #fefbf6;
  }
  .vibrant-input {
    border: 2px solid #f7db5c;
    background: #fefbf6;
  }
  .icon {
    color: #63a375;
  }
</style>
