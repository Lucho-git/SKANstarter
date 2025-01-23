<!-- src/routes/SignupSection.svelte -->
<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"
  import { sharedAppearance, oauthProviders } from "./login/login_config"
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"

  export let supabase
  export let url

  let mounted = false

  onMount(() => {
    mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        goto("/account")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  })
</script>

<section class="bg-base-100 py-16" tabindex="-1">
  <div class="container mx-auto px-4">
    <div class="mx-auto max-w-md text-center">
      <h2 class="mb-2 text-3xl font-bold">Get Started Today</h2>
      <p class="mb-8 text-base-content/70">
        Join thousands of farmers mapping their land with precision
      </p>

      <div class="rounded-xl bg-base-100 p-6 shadow-lg">
        {#if mounted}
          <Auth
            supabaseClient={supabase}
            view="sign_up"
            redirectTo={`${url}/auth/callback`}
            providers={oauthProviders}
            socialLayout="horizontal"
            showLinks={false}
            appearance={sharedAppearance}
          />
        {/if}
      </div>
    </div>
  </div>
</section>
