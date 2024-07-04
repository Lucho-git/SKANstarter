<script lang="ts">
  import { onMount } from "svelte"

  onMount(() => {
    const script = document.createElement("script")
    script.src =
      "https://userlike-cdn-widgets.s3-eu-west-1.amazonaws.com/2cd43ec1182e407b86786af88651a70c3406a32916e5484294b136f7c1567dbe.js"
    script.async = true
    script.type = "text/javascript"
    document.head.appendChild(script)
  })
</script>

<!-- The widget will be injected by the script, so we don't need to add any HTML here -->
