<!-- src/routes/(admin)/account/choose_type/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms"
  import {
    Tractor,
    Users,
    MapPin,
    ClipboardCheck,
    UserPlus,
    Navigation,
  } from "lucide-svelte"

  let selectedRole: "manager" | "operator" | null = null
  let formError: string | null = null
  export let data

  console.log("role data", data)
  const colorScheme = [
    {
      color: "bg-gradient-to-br from-info/10 to-info/20",
      borderColor: "border-info/30",
      iconColor: "text-info",
      cardStyle:
        "after:absolute after:inset-0 after:bg-info/5 after:opacity-40 after:rounded-box hover:after:opacity-60 after:transition-opacity",
    },
    {
      color: "bg-gradient-to-br from-warning/10 to-warning/20",
      borderColor: "border-warning/30",
      iconColor: "text-warning",
      cardStyle:
        "after:absolute after:inset-0 after:bg-warning/5 after:opacity-40 after:rounded-box hover:after:opacity-60 after:transition-opacity",
    },
  ]

  const roles = [
    {
      id: "manager",
      title: "Farm Manager",
      Icon: Users,
      description: "Create and oversee farm operations",
      ...colorScheme[0],
      features: [
        { text: "Manage Maps", icon: MapPin },
        { text: "Team Control", icon: UserPlus },
      ],
    },
    {
      id: "operator",
      title: "Field Operator",
      Icon: Tractor,
      description: "Execute field operations",
      ...colorScheme[1],
      features: [
        { text: "View Tasks", icon: ClipboardCheck },
        { text: "Track Progress", icon: Navigation },
      ],
    },
  ]
</script>

<div class="min-h-screen bg-base-200 px-4 py-12">
  <div class="mx-auto max-w-4xl">
    <!-- Header -->
    <div class="mb-16 text-center">
      <h1 class="mb-4 text-5xl font-bold text-base-content">
        Choose Your Role
      </h1>
    </div>

    <!-- Error Alert -->
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

    <form
      method="POST"
      use:enhance={({ form, data, action, cancel }) => {
        return async ({ result }) => {
          if (result.type === "failure") {
            formError = result.data?.error || "Something went wrong"
          } else if (result.data?.redirect) {
            window.location.href = result.data.redirect
          }
        }
      }}
    >
      <div class="grid gap-8 md:grid-cols-2">
        {#each roles as role}
          <div
            class="transition-all duration-200"
            on:click={() => (selectedRole = role.id)}
            on:keydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                selectedRole = role.id
              }
            }}
            role="button"
            tabindex="0"
          >
            <input
              type="radio"
              id={role.id}
              name="role"
              value={role.id}
              class="hidden"
              bind:group={selectedRole}
            />

            <!-- Card -->
            <div
              class="card relative cursor-pointer overflow-hidden border-2 bg-base-100 shadow-xl transition-all hover:scale-105
                  {role.color} {role.borderColor} {role.cardStyle}
                  {selectedRole === role.id ? 'ring-0 ring-offset-4' : ''}"
            >
              <div class="card-body relative z-10 items-center p-8 text-center">
                <!-- Large Icon with Glow -->
                <div class={`${role.iconColor} relative mb-6`}>
                  <div class="absolute inset-0 scale-150 opacity-30 blur-xl">
                    <svelte:component
                      this={role.Icon}
                      size={80}
                      strokeWidth={1.5}
                    />
                  </div>
                  <svelte:component
                    this={role.Icon}
                    size={80}
                    strokeWidth={1.5}
                  />
                </div>

                <!-- Title & Description -->
                <h2 class="card-title mb-2 text-3xl">{role.title}</h2>
                <p class="mb-6 text-lg text-base-content/70">
                  {role.description}
                </p>

                <!-- Features Icons -->
                <div class="flex justify-center gap-8">
                  {#each role.features as feature}
                    <div class="text-center">
                      <div class={`${role.iconColor} mb-2`}>
                        <svelte:component this={feature.icon} size={32} />
                      </div>
                      <span class="text-sm">{feature.text}</span>
                    </div>
                  {/each}
                </div>

                <!-- Selected Checkmark -->
                {#if selectedRole === role.id}
                  <div class="scale-in-center absolute right-4 top-4">
                    <div class="badge badge-primary badge-lg p-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Submit Button and Disclaimer -->
      <div class="mt-12 text-center">
        <button
          type="submit"
          class="btn btn-primary btn-lg px-12 text-lg {!selectedRole
            ? 'btn-disabled'
            : ''}"
          disabled={!selectedRole}
        >
          Continue
        </button>

        <!-- Subtle Disclaimer -->
        <p class="mt-6 text-sm italic text-base-content/50">
          Don't worry - you can access all features regardless of your role
          selection
        </p>
      </div>
    </form>
  </div>
</div>

<style>
  .scale-in-center {
    animation: scale-in-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  @keyframes scale-in-center {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
