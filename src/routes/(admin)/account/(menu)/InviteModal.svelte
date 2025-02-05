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
  let shareType = ""
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
<label for="invite-modal" class="btn btn-circle btn-primary btn-sm">
  <Icon icon="mdi:plus" width="24" height="24" />
</label>

<!-- Main Invite Modal -->
<input type="checkbox" id="invite-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box max-w-3xl bg-base-100">
    <h3
      class="mb-4 text-center text-xl font-bold text-base-content sm:mb-6 sm:text-2xl"
    >
      Join AgSKAN Map
    </h3>
    <div class="flex flex-col items-center">
      <div class="mb-4 rounded-full bg-primary/20 p-4 sm:mb-6">
        <Icon
          icon="mdi:account-group"
          class="h-12 w-12 text-primary sm:h-16 sm:w-16"
        />
      </div>

      <!-- Copy Options Container -->
      <div class="w-full space-y-4 sm:space-y-6">
        <!-- Map ID Section -->
        <div class="card bg-base-200 p-4 shadow-sm">
          <h4 class="mb-2 text-sm font-semibold text-base-content sm:text-base">
            Map ID
          </h4>
          <div class="join h-12 w-full">
            <input
              type="text"
              class="input join-item input-bordered h-12 min-w-0 flex-1 px-3 text-sm font-medium sm:px-4 sm:text-base"
              value={$connectedMapStore.id}
              readonly
            />
            <button
              class="btn btn-square btn-primary join-item h-12"
              on:click={copyMapId}
            >
              {#if mapIdCopied}
                <Check class="h-5 w-5" />
              {:else}
                <Copy class="h-5 w-5" />
              {/if}
            </button>
          </div>
          <p class="mt-2 text-xs text-base-content/60 sm:text-sm">
            Share this ID with other users to join your map
          </p>
        </div>

        <!-- Share Link Section -->
        <div class="card bg-base-200 p-4 shadow-sm">
          <h4 class="mb-2 text-sm font-semibold text-base-content sm:text-base">
            Share Link
          </h4>
          <div class="join h-12 w-full">
            <input
              type="text"
              class="input join-item input-bordered h-12 min-w-0 flex-1 px-3 text-sm font-medium sm:px-4 sm:text-base"
              value={`https://www.skanfarming.com.au/login?map_id=${$connectedMapStore.id}`}
              readonly
            />
            <button
              class="btn btn-square btn-primary join-item h-12"
              on:click={copyLink}
            >
              {#if linkCopied}
                <Check class="h-5 w-5" />
              {:else}
                <Link class="h-5 w-5" />
              {/if}
            </button>
          </div>
          <p class="mt-2 text-xs text-base-content/60 sm:text-sm">
            Share this link for direct access to your map
          </p>
        </div>
      </div>
    </div>

    <div class="modal-action mt-4 sm:mt-8">
      <div class="flex w-full justify-end">
        <div class="dropdown dropdown-end dropdown-top mr-2">
          <label tabindex="0" class="btn btn-primary btn-sm sm:btn-md">
            <Share2 class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Share
          </label>
          <ul
            tabindex="0"
            class="menu dropdown-content w-40 rounded-box bg-base-100 p-2 shadow-lg sm:w-52"
          >
            <li>
              <a on:click={() => openShareModal("phone")}>
                <Phone class="h-4 w-4 sm:h-5 sm:w-5" /> Via Phone
              </a>
            </li>
            <li>
              <a on:click={() => openShareModal("email")}>
                <Mail class="h-4 w-4 sm:h-5 sm:w-5" /> Via Email
              </a>
            </li>
          </ul>
        </div>
        <label
          for="invite-modal"
          class="btn btn-outline btn-primary btn-sm sm:btn-md"
        >
          Close
        </label>
      </div>
    </div>

    <div class="absolute right-2 top-2 text-primary">
      <Icon icon="mdi:leaf" class="h-5 w-5 sm:h-6 sm:w-6" />
    </div>
    <div class="absolute bottom-2 left-2 text-primary">
      <Icon icon="mdi:nature" class="h-5 w-5 sm:h-6 sm:w-6" />
    </div>
  </div>
</div>

<!-- Share Method Selection Modal -->
{#if showShareModal}
  <div class="modal modal-open">
    <div class="modal-box max-w-lg bg-base-100">
      <h3
        class="mb-4 text-center text-lg font-bold text-base-content sm:mb-6 sm:text-xl"
      >
        Share via {shareType === "phone" ? "Phone" : "Email"}
      </h3>

      <div class="flex flex-col space-y-6 sm:space-y-8">
        <!-- You Send Option -->
        <div class="card bg-base-200 p-4 shadow-sm">
          <h4
            class="mb-3 text-base font-semibold text-base-content sm:mb-4 sm:text-lg"
          >
            Share Directly
          </h4>
          <div class="flex flex-col space-y-2">
            <button
              class="btn btn-primary btn-sm w-full sm:btn-md"
              on:click={shareType === "phone" ? shareViaSMS : shareViaEmail}
            >
              Share via Your {shareType === "phone" ? "Phone" : "Email"}
            </button>
            <p class="text-center text-xs text-base-content/60 sm:text-sm">
              Opens your default {shareType === "phone" ? "messaging" : "email"}
              app
            </p>
          </div>
        </div>

        <div class="divider text-xs text-base-content/40 sm:text-sm">OR</div>

        <!-- AgSKAN Sends Option -->
        <div class="card bg-base-200 p-4 shadow-sm">
          <h4
            class="mb-3 text-base font-semibold text-base-content sm:mb-4 sm:text-lg"
          >
            Let AgSKAN Share
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              class="form-control tooltip tooltip-info w-full"
              data-tip="Coming soon!"
            >
              {#if shareType === "email"}
                <input
                  type="email"
                  placeholder="Enter email address"
                  class="input input-bordered h-10 w-full text-xs sm:text-base"
                  bind:value={recipientInput}
                  disabled
                />
              {:else}
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  class="input input-bordered h-10 w-full text-xs sm:text-base"
                  bind:value={recipientInput}
                  disabled
                />
              {/if}
            </div>
            <button
              class="btn btn-outline btn-primary btn-sm w-full sm:btn-md"
              on:click={handleAgSKANSend}
              disabled
            >
              Send via AgSKAN
            </button>
            <p class="text-center text-xs text-base-content/60 sm:text-sm">
              We'll send it directly to the recipient
            </p>
          </div>
        </div>
      </div>

      <div class="modal-action mt-4 sm:mt-8">
        <button
          class="btn btn-outline btn-primary btn-sm sm:btn-md"
          on:click={() => (showShareModal = false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
