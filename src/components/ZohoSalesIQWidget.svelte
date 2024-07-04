<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { userStore } from "../stores/userStore"

  export let visible = true

  let isInitialized = false
  let script: HTMLScriptElement

  function initZohoSalesIQ() {
    if (typeof window.$zoho !== "undefined" && window.$zoho.salesiq) {
      console.log("Initializing Zoho SalesIQ")
      isInitialized = true
      setVisibility()
      setUserInfo()
    } else {
      console.log("Zoho SalesIQ not available, retrying in 1 second")
      setTimeout(initZohoSalesIQ, 1000)
    }
  }

  function setVisibility() {
    if (isInitialized) {
      if (visible) {
        console.log("Showing Zoho SalesIQ")
        window.$zoho.salesiq.floatbutton.visible("show")
      } else {
        console.log("Hiding Zoho SalesIQ")
        window.$zoho.salesiq.floatbutton.visible("hide")
      }
    }
  }

  function setUserInfo() {
    if (isInitialized && $userStore.id) {
      console.log("Setting Zoho SalesIQ user info")
      window.$zoho.salesiq.visitor.name($userStore.fullName || "")
      window.$zoho.salesiq.visitor.email($userStore.email || "")
      // Assuming you have a phone field in your userStore
      if ($userStore.phone) {
        window.$zoho.salesiq.visitor.contactnumber($userStore.phone)
      }
      window.$zoho.salesiq.visitor.info({
        Company: $userStore.companyName || "",
        Website: $userStore.website || "",
      })
    }
  }

  onMount(() => {
    window.$zoho = window.$zoho || {}
    window.$zoho.salesiq = window.$zoho.salesiq || {
      widgetcode:
        "9534886c569f651bdac5e6bae55f2929b847c99b3a5d47448efe57181ff6dda1",
      values: {},
      ready: function () {
        initZohoSalesIQ()
      },
    }

    // Set visitor details while loading
    if ($userStore.id) {
      window.$zoho.salesiq.values = {
        name: $userStore.fullName || "",
        email: $userStore.email || "",
        contactnumber: $userStore.phone || "",
      }
    }

    script = document.createElement("script")
    script.id = "zsiqscript"
    script.defer = true
    script.src = "https://salesiq.zohopublic.com.au/widget"

    // Wrap the script in a try-catch block
    const originalError = console.error
    console.error = function (...args) {
      if (args[0] && args[0].toString().includes("is not valid JSON")) {
        // Suppress this specific error
        return
      }
      originalError.apply(console, args)
    }

    document.body.appendChild(script)
    console.log("Zoho SalesIQ script added to document")

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script)
      }
      console.error = originalError
      console.log("Zoho SalesIQ script removed")
    }
  })

  onDestroy(() => {
    if (isInitialized) {
      window.$zoho.salesiq.floatbutton.visible("hide")
    }
  })

  $: {
    if (isInitialized) {
      setVisibility()
    }
  }

  $: {
    if (isInitialized && $userStore.id) {
      setUserInfo()
    }
  }
</script>
