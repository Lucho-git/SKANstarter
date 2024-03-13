<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import FileUpload from "../../../../components/FileUpload.svelte"
  import UserFiles from "../../../../components/UserFiles.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("home")
</script>

<svelte:head>
  <title>Account</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-1">Dashboard</h1>
<div class="alert alert-success max-w-lg mt-2">
  <img src="/images/file-upload-icon.svg" alt="Gear" class="w-14 h-14" />

  <div>
    <div class="font-bold">Upload Paddock</div>
    <div class="my-2">
      <FileUpload />
    </div>
    <div class="my-2"></div>
  </div>
</div>

<div class="alert alert-success max-w-lg mt-2">
  <div>
    <div class="font-bold">User Files</div>
    <div class="my-2">
      <UserFiles />
    </div>
    <div class="my-2"></div>
  </div>
</div>

<div class="my-6">
  <h1 class="text-xl font-bold mb-1">Farm</h1>
  <div class="stats shadow stats-vertical sm:stats-horizontal sm:w-[420px]">
    <div class="stat place-items-center">
      <div class="stat-title">Paddocks</div>
      <div class="stat-value">3</div>
      <div class="stat-desc">↗︎ 546 (2%)</div>
    </div>

    <div class="stat place-items-center">
      <div class="stat-title">Hectares</div>
      <div class="stat-value text-secondary">4,200</div>
      <div class="stat-desc">↗︎ 40 (2%)</div>
    </div>
  </div>
</div>
<div class="my-6">
  <h1 class="text-xl font-bold mb-1">Accounts</h1>
  <div class="stats shadow stats-vertical sm:stats-horizontal sm:w-[420px]">
    <div class="stat place-items-center">
      <div class="stat-title">New Registers</div>
      <div class="stat-value">1,200</div>
      <div class="stat-desc">↘︎ 90 (14%)</div>
    </div>

    <div class="stat place-items-center">
      <div class="stat-title">Churned Accounts</div>
      <div class="stat-value">42</div>
      <div class="stat-desc">↘︎ 6 (12%)</div>
    </div>
  </div>
</div>
<div class="my-6">
  <h1 class="text-xl font-bold mb-1">Revenue</h1>
  <div class="stats shadow stats-vertical sm:stats-horizontal sm:w-[420px]">
    <div class="stat place-items-center">
      <div class="stat-title text-success">Revenue</div>
      <div class="stat-value text-success">$4200</div>
      <div class="stat-desc">↗︎ $180 (4%)</div>
    </div>

    <div class="stat place-items-center">
      <div class="stat-title">New Subscribers</div>
      <div class="stat-value">16</div>
      <div class="stat-desc">↘︎ 1 (%7)</div>
    </div>
  </div>
</div>
