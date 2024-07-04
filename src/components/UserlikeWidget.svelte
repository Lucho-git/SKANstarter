<!-- UserlikeWidget.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { userStore } from "../stores/userStore"
  import { page } from "$app/stores"

  export let visible = false

  let userlike: any
  let unsubscribe: () => void

  const WIDGET_KEY =
    "2cd43ec1182e407b86786af88651a70c3406a32916e5484294b136f7c1567dbe"

  async function createApi() {
    const { createMessenger } = await import("@userlike/messenger")
    const result = await createMessenger({
      version: 1,
      widgetKey: WIDGET_KEY,
    })
    return result.value.api
  }

  async function initializeUserlike() {
    userlike = await createApi()
    await userlike.mount()
    updateVisibility()
    setUserInfo()
  }

  function updateVisibility() {
    if (userlike) {
      userlike.setVisibility({
        main: visible,
        button: visible,
        notifications: visible,
      })
    }
  }

  function setUserInfo() {
    if (userlike && $userStore.id) {
      userlike.setContactInfo({
        name: $userStore.fullName || "",
        email: $userStore.email || "",
      })

      const customData = {
        companyName: $userStore.companyName || "",
        website: $userStore.website || "",
      }
      userlike.setCustomData(customData)
    }
  }

  onMount(() => {
    initializeUserlike()

    unsubscribe = userStore.subscribe(() => {
      setUserInfo()
    })
  })

  onDestroy(() => {
    if (userlike) {
      userlike.unmount()
    }
    if (unsubscribe) {
      unsubscribe()
    }
  })

  $: if (userlike) {
    updateVisibility()
  }
</script>
