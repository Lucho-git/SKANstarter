<script>
  export let href = "/"
</script>

<svelte:head>
  <link
    rel="preload"
    href="/fonts/archivo-latin-900-normal.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
</svelte:head>

<div class="flex-1">
  <a {href} class="inline-block mt-4">
    <div
      class="card card-side bg-secondary shadow-md hover:bg-secondary-focus rounded-3xl"
    >
      <div class="card-body flex flex-row">
        <div class="flex items-center pl-0">
          <div class="w-16 h-16 flex justify-center items-center">
            <img
              src="/images/gear_2.svg"
              alt="Gear"
              class="max-w-full max-h-full"
            />
          </div>
        </div>
        <div class="flex-1 text-secondary-content">
          <div class="card-title font-black font-archivo text-4xl">SKAN</div>
          <p class="font-medium text-base whitespace-nowrap">
            Farming Logistics
          </p>
        </div>
      </div>
    </div>
  </a>
</div>

<style>
  @font-face {
    font-family: "Archivo";
    src: url("/fonts/archivo-latin-900-normal.woff2") format("woff2");
    font-weight: 900;
    font-style: normal;
    font-display: swap;
  }

  .font-archivo {
    font-family: "Archivo", Arial, sans-serif;
  }
</style>
