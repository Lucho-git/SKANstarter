<script lang="ts">
  import { onMount } from "svelte"

  onMount(() => {
    const script = document.createElement("script")
    script.src = "https://static.elfsight.com/platform/platform.js"
    script.setAttribute("data-use-service-core", "")
    script.defer = true
    document.head.appendChild(script)
  })
</script>

<div
  class="elfsight-app-ca1959e2-2346-4cf0-871c-443876e7b9ff"
  data-elfsight-app-lazy
></div>
