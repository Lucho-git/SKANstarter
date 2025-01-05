<script>
  export let href = "/old"
</script>

<div class="flex-1">
  <a {href} class="mt-4 inline-block">
    <div
      class="hover:bg-secondary-focus card card-side rounded-3xl bg-secondary shadow-md"
    >
      <div class="card-body flex flex-row">
        <div class="flex items-center pl-0">
          <div class="flex h-16 w-16 items-center justify-center">
            <img
              src="/images/gear_2.svg"
              alt="Gear"
              class="max-h-full max-w-full"
            />
          </div>
        </div>
        <div class="flex-1 text-secondary-content">
          <div class="card-title font-archivo text-4xl font-black">SKAN</div>
          <p class="whitespace-nowrap text-base font-medium">
            Farming Logistics
          </p>
        </div>
      </div>
    </div>
  </a>
</div>

<style>
  .font-archivo {
    font-family: "Archivo", Arial, sans-serif;
  }
</style>
