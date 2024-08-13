<script lang="ts">
  import "../../../../app.css"
  import { enhance, applyAction } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"
  import { goto } from "$app/navigation"

  export let data
  export let form: FormAccountUpdateResult

  let { session, profile } = data

  let loading = false
  let fullName: string = profile?.full_name ?? ""
  let companyName: string = profile?.company_name ?? ""
  let website: string = profile?.website ?? ""

  const fieldError = (liveForm: FormAccountUpdateResult, name: string) => {
    let errors = liveForm?.errorFields ?? []
    return errors.includes(name)
  }

  //Creates the profile and then creates the subscription right afterwards
  const handleSubmit: SubmitFunction = () => {
    loading = true
    return async ({ update, result }) => {
      console.log("Form submitted")
      await update({ reset: false })
      console.log("Form updated")
      await applyAction(result)
      console.log("Action applied")

      if (result.type === "success") {
        console.log("Form submission successful, creating user subscription")
        try {
          const response = await fetch("/account/api?/updateUserSubscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "updateUserSubscription" }),
          })

          console.log("response", response)
          if (!response.ok) {
            throw new Error("Failed to update user subscription")
          }

          console.log("User subscription updated successfully")
          goto("/account/user_survey")
        } catch (error) {
          console.error("Error updating user subscription:", error)
        }
      }

      loading = false
      console.log("handleSubmit completed")
    }
  }

  $: {
    if (form) {
      console.log("Form result:", form)
    }
  }
</script>

<svelte:head>
  <title>Create Profile</title>
</svelte:head>

<div
  class="mx-auto mb-12 flex min-h-[100vh] max-w-lg place-content-center content-center items-center text-center"
>
  <div class="flex w-64 flex-col lg:w-80">
    <div>
      <h1 class="mb-6 text-2xl font-bold">Create Profile</h1>
      <form
        class="form-widget"
        method="POST"
        action="/account/api?/createProfile"
        use:enhance={handleSubmit}
      >
        <div class="mt-4">
          <label for="fullName" class="label">
            <span class="label-text">Name</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Your full name"
            class="{fieldError(form, 'fullName')
              ? 'input-error'
              : ''} input input-bordered mt-1 w-full max-w-xs border-2 border-primary"
            value={form?.fullName ?? fullName}
            required
          />
        </div>

        <div class="mt-4">
          <label for="companyName" class="label">
            <span class="label-text">Company Name</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            placeholder="Homewood Farms"
            class="{fieldError(form, 'companyName')
              ? 'input-error'
              : ''} input input-bordered mt-1 w-full max-w-xs"
            value={form?.companyName ?? companyName}
          />
        </div>

        <div class="mt-4">
          <label for="website" class="label">
            <span class="label-text">Company Website</span>
          </label>
          <input
            id="website"
            name="website"
            type="text"
            placeholder="Company.com"
            class="{fieldError(form, 'website')
              ? 'input-error'
              : ''} input input-bordered mt-1 w-full max-w-xs"
            value={form?.website ?? website}
          />
        </div>

        {#if form?.errorMessage}
          <div class="mt-4"></div>
          <p class="mt-3 text-center text-sm font-bold text-red-700">
            {form?.errorMessage}
          </p>
        {/if}
        <div class="mt-4">
          <input
            type="submit"
            class="btn btn-primary btn-wide mt-3"
            value={loading ? "..." : "Create Profile"}
            disabled={loading}
          />
        </div>
      </form>

      <div class="mt-14 text-sm text-slate-800">
        You are logged in as {session?.user?.email}.
        <br />
        <a class="underline" href="/features/"> Sign out </a>
      </div>
    </div>
  </div>
</div>
