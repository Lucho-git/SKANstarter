<script>
  import "../../app.css"
  import ThemeSwitcher from "../../components/ThemeSwitcher.svelte"
  import Error from "../+error.svelte"
  import LogoCard from "../../components/LogoCard.svelte"
  import FloatingContact from "../../components/FloatingContact.svelte"
  import Footer from "./Footer.svelte"
  import Footer2 from "./Footer2.svelte"
  import { deviceStore } from "../../stores/deviceStore"
  import { onMount } from "svelte"

  let innerWidth = 0

  $: deviceStore.updateInnerWidth(innerWidth)
</script>

<!-- <ThemeSwitcher /> -->
<svelte:window bind:innerWidth />

<div class="container navbar mx-auto bg-base-100">
  <LogoCard href="/" />
  <div class="flex-none">
    <ul class="menu menu-horizontal hidden px-1 text-lg font-bold sm:flex">
      <li class="md:mx-2"><a href="/features">Features</a></li>
      <li class="md:mx-2"><a href="/team">Team</a></li>
      <li class="md:mx-2"><a href="/pricing">Pricing</a></li>
      <li class="md:mx-4">
        <a href="/login" class="border border-primary">★ Enter</a>
      </li>
    </ul>
    <div class="dropdown dropdown-end sm:hidden">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <label tabindex="0" class="btn btn-circle btn-ghost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </label>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <!-- mobile/smallscreen dropdown menu -->
      <ul
        tabindex="0"
        class="menu dropdown-content rounded-box menu-lg z-[1] mt-3 w-52 bg-base-100 p-2 font-bold shadow"
      >
        <li><a href="/features">Features</a></li>
        <li><a href="/team">Team</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li>
          <a href="/login" class="border border-primary">★ Enter</a>
        </li>
      </ul>
    </div>
  </div>
</div>

<FloatingContact />

<div class="">
  <slot />
</div>

<!-- Spacer grows so the footer can be at bottom on short pages -->
{#if !$deviceStore}
  <Footer />
{:else}
  <Footer2 />
{/if}
