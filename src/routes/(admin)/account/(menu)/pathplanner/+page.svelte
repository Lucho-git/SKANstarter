<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import LogoCard from "../../../../../components/LogoCard.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("pathplanner")
</script>

<svelte:head>
  <title>PathPlanner</title>
</svelte:head>

<div class="container mx-auto mt-12 flex justify-center">
  <div class="text-center">
    <h2 class="text-3xl font-bold mb-4">Welcome to PathPlanner!</h2>
    <p class="mb-6">
      You are logged in and ready to start planning your paths.
    </p>
    <div class="flex justify-center">
      <div class="mockup-phone">
        <div class="camera"></div>
        <div class="display">
          <div class="artboard artboard-demo phone-1">Hi.</div>
        </div>
      </div>
    </div>
  </div>
</div>
