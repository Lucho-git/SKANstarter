<script lang="ts">
  import { featuresInfo } from "./posts.json"
</script>

<svelte:head>
  <title>{featuresInfo.name}</title>
  <meta name="description" content="Our features posts." />
</svelte:head>

<div class="py-8 lg:py-12 px-6 max-w-lg mx-auto">
  <div
    class="text-3xl lg:text-5xl font-medium text-primary flex gap-3 items-baseline text-center place-content-center"
  >
    <div
      class="text-center leading-relaxed font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
    >
      {featuresInfo.name}
    </div>
  </div>
  <div class="text-lg font-bold text-center">Current Features</div>

  <!-- features Post 3 -->
  <a href="/features/agskan">
    <div class="card my-6 bg-white shadow-xl flex-row overflow-hidden">
      <div class="flex-none w-6 md:w-32 bg-info"></div>
      <div class="py-6 px-6">
        <div class="text-xl">AgSKAN</div>
        <div class="text-slate-500">
          Live Interactive map to mark features, visualise completed work and
          see everything happening on your farm at a glance
        </div>
      </div>
    </div></a
  >
  <!-- Add any elements between posts here -->
  <div class="text-lg font-bold text-center">Future Projects</div>

  <!-- features Post 1 -->
  <a href="/features/paddock_path">
    <div class="card my-6 bg-white shadow-xl flex-row overflow-hidden">
      <div class="flex-none w-6 md:w-32 bg-secondary"></div>
      <div class="py-6 px-6">
        <div class="text-xl">PaddockPath</div>
        <div class="text-slate-500">Optimise your farming routes</div>
      </div>
    </div>
  </a>

  <!-- features Post 2 -->
  <a href="/features/pipeline">
    <div class="card my-6 bg-white shadow-xl flex-row overflow-hidden">
      <div class="flex-none w-6 md:w-32 bg-secondary"></div>
      <div class="py-6 px-6">
        <div class="text-xl">SKAN Pipeline</div>
        <div class="text-slate-500">
          We have big dreams like the rest of you, read through our projects in
          the Pipeline and come along this journey with us, see how we can help
          your farm.
        </div>
      </div>
    </div>
  </a>

  <!-- Add more features posts as needed -->
</div>
