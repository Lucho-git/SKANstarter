<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"
  import { sharedAppearance, oauthProviders } from "../login_config"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { page } from "$app/stores"

  export let data
  let { supabase } = data

  // Get the initial tab from the query parameter, default to "sign_in" if not present
  $: activeTab =
    $page.url.searchParams.get("tab") === "sign_up" ? "sign_up" : "sign_in"

  onMount(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event == "SIGNED_IN") {
        setTimeout(() => {
          goto("/account")
        }, 1)
      }
    })
  })
</script>

<svelte:head>
  <title>Sign In / Sign Up</title>
</svelte:head>

<div class="w-full max-w-xl mx-auto">
  <div class="flex justify-around mb-5">
    <button
      class={`px-5 py-2 ${activeTab === "sign_in" ? "font-bold border-b-2 border-black" : ""}`}
      on:click={() => (activeTab = "sign_in")}>Sign In</button
    >
    <button
      class={`px-5 py-2 ${activeTab === "sign_up" ? "font-bold border-b-2 border-black" : ""}`}
      on:click={() => (activeTab = "sign_up")}>Sign Up</button
    >
  </div>

  <div class="p-5 border border-gray-300 rounded-lg">
    <div class="auth-wrapper">
      <Auth
        supabaseClient={data.supabase}
        view={activeTab === "sign_in" ? "sign_in" : "sign_up"}
        redirectTo={`${data.url}/auth/callback`}
        providers={oauthProviders}
        socialLayout="horizontal"
        showLinks={false}
        appearance={sharedAppearance}
      />
    </div>
    {#if activeTab === "sign_in"}
      <div class="text-l text-slate-800 mt-4">
        <a class="underline" href="/login/forgot_password">Forgot password?</a>
      </div>
    {/if}
  </div>
</div>

{#if $page.url.searchParams.get("verified") == "true"}
  <div role="alert" class="alert alert-success mt-5">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      /></svg
    >
    <span>Email verified! Please sign in.</span>
  </div>
{/if}

<style>
  :global(.auth-wrapper > div) {
    width: 100% !important;
    max-width: none !important;
  }
</style>
