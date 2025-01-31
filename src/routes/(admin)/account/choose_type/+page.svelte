<!-- src/routes/(admin)/account/choose_type/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms"
  import {
    Tractor,
    Users,
    MapPin,
    ClipboardCheck,
    Settings,
    UserPlus,
    Navigation,
    Users2,
  } from "lucide-svelte"

  let selectedRole: "manager" | "operator" | null = null
  let formError: string | null = null

  const roles = [
    {
      id: "manager",
      title: "Farm Manager",
      Icon: Users,
      description: "Create and oversee farm operations",
      color: "bg-success/10",
      borderColor: "border-success/20",
      iconColor: "text-success",
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
      color: "bg-primary/10",
      borderColor: "border-primary/20",
      iconColor: "text-primary",
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
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <span>{formError}</span>
      </div>
    {/if}

    <form
      method="POST"
      use:enhance={({ data }) => {
        if (data?.error) {
          formError = data.error
        }
        return async () => {
          formError = null
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
              class="card cursor-pointer border-2 bg-base-100 shadow-xl transition-transform hover:scale-105
                {role.color} {role.borderColor} 
                {selectedRole === role.id
                ? 'ring-4 ring-primary ring-offset-4'
                : ''}"
            >
              <div class="card-body items-center p-8 text-center">
                <!-- Large Icon -->
                <div class={`${role.iconColor} mb-6`}>
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

      <!-- Submit Button -->
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
