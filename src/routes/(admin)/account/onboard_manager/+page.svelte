<!-- src/routes/(admin)/account/onboard_manager/+page.svelte -->
<script lang="ts">
  import { goto } from "$app/navigation"
  import { enhance } from "$app/forms"
  import { User, Building2, Phone } from "lucide-svelte"
  import { toast } from "svelte-sonner"

  export let data

  let formError: string | null = null
  let fullName = ""
  let companyName = ""
  let mobile = ""
  let contactable = true // Set to true by default

  // Computed property for form validation
  $: isFormValid =
    fullName.trim().length > 0 &&
    companyName.trim().length > 0 &&
    mobile.replace(/\D/g, "").length >= 8 &&
    mobile.replace(/\D/g, "").length <= 10

  // Phone number formatting
  function formatPhoneNumber(value: string) {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, "")

    // Format as 04XX XXX XXX
    if (cleaned.length <= 4) {
      return cleaned
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
    } else {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`
    }
  }

  function handlePhoneInput(event: Event) {
    const input = event.target as HTMLInputElement
    const formatted = formatPhoneNumber(input.value)
    mobile = formatted
  }

  function handleEnhance() {
    return async ({ result }) => {
      if (result.type === "success") {
        toast.success("Setup completed successfully!")
        goto("/account/user_survey")
      } else {
        formError = result.data?.error || "Something went wrong"
        toast.error(formError)
      }
    }
  }
</script>

<div class="min-h-screen bg-base-200 px-4 py-12">
  <div class="mx-auto max-w-xl">
    <div class="mb-16 text-center">
      <h1 class="mb-4 text-5xl font-bold text-base-content">Farm Details</h1>
      <p class="text-xl text-base-content/70">Tell us about your operation</p>
    </div>

    {#if formError}
      <div class="alert alert-error mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{formError}</span>
      </div>
    {/if}

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form method="POST" use:enhance={handleEnhance}>
          <div class="form-control mb-6">
            <label class="label items-center gap-2">
              <User size={18} class="text-base-content/70" />
              <span class="label-text">Full Name</span>
            </label>
            <input
              type="text"
              name="name"
              bind:value={fullName}
              placeholder="Enter your full name"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control mb-6">
            <label class="label items-center gap-2">
              <Building2 size={18} class="text-base-content/70" />
              <span class="label-text">Company/Farm Name</span>
            </label>
            <input
              type="text"
              name="company_name"
              bind:value={companyName}
              placeholder="Enter your company name"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control mb-6">
            <label class="label items-center gap-2">
              <Phone size={18} class="text-base-content/70" />
              <span class="label-text">Mobile Number</span>
            </label>
            <input
              type="tel"
              name="mobile"
              bind:value={mobile}
              on:input={handlePhoneInput}
              placeholder="04XX XXX XXX"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control mb-8">
            <label class="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                bind:checked={contactable}
                name="contactable"
                class="checkbox checkbox-sm"
              />
              <span class="label-text">
                I agree to be contacted for setup assistance and important
                updates
              </span>
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            disabled={!isFormValid}
          >
            Continue to Map Setup
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
