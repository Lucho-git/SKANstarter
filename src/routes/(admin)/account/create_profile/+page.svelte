<script lang="ts">
  import "../../../../app.css"
  import { enhance, applyAction } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"

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

  const handleSubmit: SubmitFunction = () => {
    loading = true
    return async ({ update, result }) => {
      console.log("Form submitted")
      await update({ reset: false })
      console.log("Form updated")
      await applyAction(result)
      console.log("Action applied")
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
  class="text-center content-center max-w-lg mx-auto min-h-[100vh] mb-12 flex items-center place-content-center"
>
  <div class="flex flex-col w-64 lg:w-80">
    <div>
      <h1 class="text-2xl font-bold mb-6">Create Profile</h1>
      <form
        class="form-widget"
        method="POST"
        action="/account/api?/updateProfile"
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
              : ''} mt-1 input input-bordered w-full max-w-xs border-2 border-primary"
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
              : ''} mt-1 input input-bordered w-full max-w-xs"
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
              : ''} mt-1 input input-bordered w-full max-w-xs"
            value={form?.website ?? website}
          />
        </div>

        {#if form?.errorMessage}
          <div class="mt-4"></div>
          <p class="text-red-700 text-sm font-bold text-center mt-3">
            {form?.errorMessage}
          </p>
        {/if}
        <div class="mt-4">
          <input
            type="submit"
            class="btn btn-primary mt-3 btn-wide"
            value={loading ? "..." : "Create Profile"}
            disabled={loading}
          />
        </div>
      </form>

      <div class="text-sm text-slate-800 mt-14">
        You are logged in as {session?.user?.email}.
        <br />
        <a class="underline" href="/features/"> Sign out </a>
      </div>
    </div>
  </div>
</div>
