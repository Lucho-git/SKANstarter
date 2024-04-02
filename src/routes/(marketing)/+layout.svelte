<script>
  import "../../app.css"
  import ThemeSwitcher from "../../components/ThemeSwitcher.svelte"
  import Error from "../+error.svelte"
  import LogoCard from "../../components/LogoCard.svelte"
  import { user } from "../../stores/user.ts"
  import FloatingContact from "../../components/FloatingContact.svelte"
  import Footer from "../../components/Footer.svelte"
  import Footer2 from "../../components/Footer2.svelte"
  import { deviceStore } from "../../stores/deviceStore"

  let innerWidth = 0

  $: deviceStore.updateInnerWidth(innerWidth)
</script>

<!-- <ThemeSwitcher /> -->
<svelte:window bind:innerWidth />

<div class="navbar bg-base-100 container mx-auto">
  <LogoCard href="/" />
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1 hidden sm:flex font-bold text-lg">
      <li class="md:mx-2"><a href="/features">Features</a></li>
      <li class="md:mx-2"><a href="/team">Team</a></li>
      <li class="md:mx-2"><a href="/pricing">Pricing</a></li>
      <li class="md:mx-4">
        {#if $user}
          <a href="/account" class="border border-primary">Dashboard</a>
        {:else}
          <a href="/login/sign_up" class="border border-primary">★ Enter</a>
        {/if}
      </li>
    </ul>
    <div class="dropdown dropdown-end sm:hidden">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <label tabindex="0" class="btn btn-ghost btn-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h7"
          /></svg
        >
      </label>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <!-- mobile/smallscreen dropdown menu -->

      <ul
        tabindex="0"
        class="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 font-bold"
      >
        <li><a href="/features">Features</a></li>
        <li><a href="/team">Team</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li>
          {#if $user}
            <a href="/account" class="border border-primary">★ Dashboard</a>
            <div class="text-sm font-bold mt-1">
              Welcome, {$user.user_metadata.name}!
            </div>
          {:else}
            <a href="/login/sign_up" class="border border-primary">★ Enter</a>
          {/if}
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
