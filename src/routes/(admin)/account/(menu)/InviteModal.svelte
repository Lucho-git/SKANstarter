<script>
  import {
    Check,
    Copy,
    Share2,
    UserPlus,
    Phone,
    Mail,
    Link,
  } from "lucide-svelte"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import Icon from "@iconify/svelte"
  import { toast } from "svelte-sonner"

  let mapIdCopied = false
  let linkCopied = false
  let showShareModal = false
  let shareType = "" // 'email' or 'phone'
  let recipientInput = ""

  function copyMapId() {
    if ($connectedMapStore.id) {
      navigator.clipboard.writeText($connectedMapStore.id)
      mapIdCopied = true
      setTimeout(() => (mapIdCopied = false), 2000)
      toast.success("Map ID Copied to Clipboard")
    }
  }

  function copyLink() {
    const shareUrl = `https://www.skanfarming.com.au/login?map_id=${$connectedMapStore.id}`
    navigator.clipboard.writeText(shareUrl)
    linkCopied = true
    setTimeout(() => (linkCopied = false), 2000)
    toast.success("Link Copied to Clipboard")
  }

  function shareViaSMS() {
    const shareUrl = `https://www.skanfarming.com.au/login?map_id=${$connectedMapStore.id}`
    const messageText = `Join my SKAN farming map using this link: ${shareUrl}`
    const encodedMessage = encodeURIComponent(messageText)
    window.location.href = `sms:?&body=${encodedMessage}`
    showShareModal = false
  }

  function shareViaEmail() {
    const shareUrl = `https://www.skanfarming.com.au/login?map_id=${$connectedMapStore.id}`
    const emailSubject = "Join my SKAN farming map"
    const messageText = `Join my SKAN farming map using this link: ${shareUrl}`
    const encodedSubject = encodeURIComponent(emailSubject)
    const encodedBody = encodeURIComponent(messageText)
    window.location.href = `mailto:?subject=${encodedSubject}&body=${encodedBody}`
    showShareModal = false
  }

  function openShareModal(type) {
    shareType = type
    showShareModal = true
    recipientInput = ""
  }

  function handleAgSKANSend() {
    toast.info("This feature is coming soon!")
  }
</script>

<!-- Invite Button -->
<label for="invite-modal" class="vibrant-button btn btn-circle btn-sm">
  <Icon icon="mdi:plus" width="24" height="24" />
</label>

<!-- Main Invite Modal -->
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

      <!-- Copy Options Container -->
      <div class="w-full max-w-xl space-y-6">
        <!-- Map ID Section -->
        <div class="sharing-option">
          <h4 class="mb-2 font-semibold">Map ID</h4>
          <div class="form-control w-full">
            <div class="input-group">
              <input
                type="text"
                class="vibrant-input input flex-grow text-[#232322]"
                value={$connectedMapStore.id}
                readonly
              />
              <button
                class="vibrant-button btn btn-square"
                on:click={copyMapId}
              >
                {#if mapIdCopied}
                  <Check class="h-5 w-5" />
                {:else}
                  <Copy class="h-5 w-5" />
                {/if}
              </button>
            </div>
          </div>
          <p class="mt-2 text-sm text-gray-600">
            Share this ID with other users to join your map
          </p>
        </div>

        <!-- Share Link Section -->
        <div class="sharing-option">
          <h4 class="mb-2 font-semibold">Share Link</h4>
          <div class="form-control w-full">
            <div class="input-group">
              <input
                type="text"
                class="vibrant-input input flex-grow text-[#232322]"
                value={`https://www.skanfarming.com.au/login?map_id=${$connectedMapStore.id}`}
                readonly
              />
              <button class="vibrant-button btn btn-square" on:click={copyLink}>
                {#if linkCopied}
                  <Check class="h-5 w-5" />
                {:else}
                  <Link class="h-5 w-5" />
                {/if}
              </button>
            </div>
          </div>
          <p class="mt-2 text-sm text-gray-600">
            Share this link for direct access to your map
          </p>
        </div>
      </div>
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
            class="menu dropdown-content w-52 rounded-box bg-base-100 p-2 shadow"
          >
            <li>
              <a on:click={() => openShareModal("phone")}
                ><Phone class="h-5 w-5" /> Via Phone</a
              >
            </li>
            <li>
              <a on:click={() => openShareModal("email")}
                ><Mail class="h-5 w-5" /> Via Email</a
              >
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

<!-- Share Method Selection Modal -->
{#if showShareModal}
  <div class="modal modal-open">
    <div class="vibrant-theme modal-box p-8">
      <h3 class="vibrant-text mb-6 text-center text-xl font-bold">
        Share via {shareType === "phone" ? "Phone" : "Email"}
      </h3>

      <div class="flex flex-col space-y-8">
        <!-- You Send Option -->
        <div class="sharing-option">
          <h4 class="mb-4 text-lg font-semibold">Share Directly</h4>
          <div class="flex flex-col space-y-2">
            <button
              class="vibrant-button btn w-full"
              on:click={shareType === "phone" ? shareViaSMS : shareViaEmail}
            >
              Share via Your {shareType === "phone" ? "Phone" : "Email"}
            </button>
            <p class="text-center text-sm text-gray-600">
              Opens your default {shareType === "phone" ? "messaging" : "email"}
              app
            </p>
          </div>
        </div>

        <!-- Divider -->
        <div class="divider text-gray-400">OR</div>

        <!-- AgSKAN Sends Option -->
        <div class="sharing-option">
          <h4 class="mb-4 text-lg font-semibold">Let AgSKAN Share</h4>
          <div class="flex flex-col space-y-2">
            <div
              class="form-control tooltip tooltip-info w-full"
              data-tip="Coming soon!"
            >
              {#if shareType === "email"}
                <input
                  type="email"
                  placeholder="Enter email address"
                  class="vibrant-input input w-full"
                  bind:value={recipientInput}
                  disabled
                />
              {:else}
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  class="vibrant-input input w-full"
                  bind:value={recipientInput}
                  disabled
                />
              {/if}
            </div>
            <button
              class="vibrant-button-outlined btn w-full"
              on:click={handleAgSKANSend}
              disabled
            >
              Send via AgSKAN
            </button>
            <p class="text-center text-sm text-gray-600">
              We'll send it directly to the recipient
            </p>
          </div>
        </div>
      </div>

      <div class="modal-action mt-8">
        <button
          class="vibrant-button-outlined btn"
          on:click={() => (showShareModal = false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

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
  .vibrant-button:disabled {
    background: #a3c2b0;
    cursor: not-allowed;
  }
  .vibrant-input {
    border: 2px solid #f7db5c;
    background: #fefbf6;
  }
  .vibrant-input:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
  }
  .icon {
    color: #63a375;
  }
  .sharing-option {
    background: #fff;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .divider {
    margin: 1rem 0;
    text-align: center;
    font-weight: 500;
  }
  .divider::before,
  .divider::after {
    background-color: #e5e7eb;
  }
</style>
