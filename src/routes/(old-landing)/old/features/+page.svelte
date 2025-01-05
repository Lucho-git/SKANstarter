<script lang="ts">
  import { featuresInfo } from "./posts.json"
</script>

<svelte:head>
  <title>{featuresInfo.name}</title>
  <meta name="description" content="Our features posts." />
</svelte:head>

<div class="mx-auto max-w-lg px-6 py-8 lg:py-12">
  <div
    class="flex place-content-center items-baseline gap-3 text-center text-3xl font-medium text-primary lg:text-5xl"
  >
    <div
      class="bg-gradient-to-r from-primary to-accent bg-clip-text text-center font-bold leading-relaxed text-transparent"
    >
      {featuresInfo.name}
    </div>
  </div>
  <div class="text-center text-lg font-bold">Current Features</div>

  <!-- features Post 3 -->
  <a href="/old/features/agskan">
    <div class="card my-6 flex-row overflow-hidden bg-white shadow-xl">
      <div class="w-6 flex-none bg-info md:w-32"></div>
      <div class="px-6 py-6">
        <div class="text-xl">AgSKAN</div>
        <div class="text-slate-500">
          Live Interactive map to mark features, track operators and visualise
          completed work
        </div>
      </div>
    </div></a
  >
  <!-- Add any elements between posts here -->
  <div class="text-center text-lg font-bold">Future Projects</div>

  <!-- features Post 1 -->
  <a href="/old/features/paddock_path">
    <div class="card my-6 flex-row overflow-hidden bg-white shadow-xl">
      <div class="w-6 flex-none bg-secondary md:w-32"></div>
      <div class="px-6 py-6">
        <div class="text-xl">PaddockPath</div>
        <div class="text-slate-500">Optimise your farming routes</div>
      </div>
    </div>
  </a>

  <!-- features Post 2 -->
  <a href="/old/features/pipeline">
    <div class="card my-6 flex-row overflow-hidden bg-white shadow-xl">
      <div class="w-6 flex-none bg-secondary md:w-32"></div>
      <div class="px-6 py-6">
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
