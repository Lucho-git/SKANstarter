<script lang="ts">
  import { page } from "$app/stores"
  import "../../../../app.css"
  import { writable, derived } from "svelte/store"
  import { setContext } from "svelte"
  import Icon from "@iconify/svelte"

  const adminSectionStore = writable("")
  setContext("adminSection", adminSectionStore)

  let isExpanded = true

  const shouldShowDrawer = derived(
    page,
    ($page) => !$page.url.pathname.includes("/account/mapviewer"),
  )

  function toggleSidebar() {
    isExpanded = !isExpanded
  }

  const selectedColor = "bg-neutral"
  const activeColor = "bg-neutral-content bg-opacity-10 text-neutral-content"
  const hoverColor = "hover:bg-neutral-content hover:text-neutral group"

  const menuItems = [
    { href: "/account", icon: "solar:home-bold-duotone", label: "Home" },
    {
      href: "/account/mapviewer",
      icon: "solar:map-point-wave-bold-duotone",
      label: "Map",
    },
    {
      href: "/account/fieldview",
      icon: "solar:map-bold-duotone",
      label: "Fields",
    },
    {
      href: "/account/pathplanner",
      icon: "solar:routing-2-bold-duotone",
      label: "Paths",
    },
    {
      href: "/account/billing",
      icon: "solar:wallet-money-bold-duotone",
      label: "Billing",
    },
    {
      href: "/account/settings",
      icon: "solar:settings-bold-duotone",
      label: "Settings",
    },
  ]
</script>

<div class="drawer lg:drawer-open">
  <input id="admin-drawer" type="checkbox" class="drawer-toggle" />

  <div class="drawer-content flex min-h-screen flex-col">
    <div class="flex-grow overflow-auto">
      <div class="container px-6 py-3 lg:px-12 lg:py-6">
        <slot />
      </div>
    </div>

    {#if $shouldShowDrawer}
      <!-- Mobile Bottom Navbar -->
      <nav
        class="fixed bottom-0 left-0 right-0 z-50 bg-neutral text-neutral-content lg:hidden"
      >
        <ul class="flex h-16 items-stretch">
          {#each menuItems as item}
            <li class="flex-1">
              <a
                href={item.href}
                class="flex h-full flex-col items-center justify-center p-1 {$adminSectionStore ===
                item.label.toLowerCase()
                  ? 'bg-neutral-content text-neutral'
                  : ''} transition-colors duration-200 hover:bg-neutral-content hover:text-neutral"
              >
                <Icon icon={item.icon} width="24" height="24" />
                <span class="mt-1 text-xs">{item.label}</span>
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}
  </div>

  {#if $shouldShowDrawer}
    <!-- Desktop Sidebar -->
    <div class="drawer-side">
      <label for="admin-drawer" class="drawer-overlay"></label>
      <ul
        class="menu menu-lg min-h-full w-80 p-4 {selectedColor} text-neutral-content lg:border-r"
        class:w-80={isExpanded}
        class:w-35={!isExpanded}
      >
        <li class="my-1">
          <button
            on:click={toggleSidebar}
            class="toggle-sidebar-btn focus:bg-focus focus:text-focus-content flex w-full items-center rounded-lg bg-neutral px-3 hover:bg-neutral-content hover:text-neutral"
          >
            <Icon
              icon={isExpanded
                ? "solar:alt-arrow-left-bold-duotone"
                : "solar:alt-arrow-right-bold-duotone"}
              width="28"
              height="28"
              class="group-hover:text-neutral"
            />
            {#if isExpanded}<span class="ml-2">Collapse Menu</span>{/if}
          </button>
        </li>

        {#each menuItems as item}
          <li class="my-1">
            <a
              href={item.href}
              class="{$adminSectionStore === item.label.toLowerCase()
                ? activeColor
                : ''} {hoverColor} flex items-center rounded-lg px-3"
            >
              <Icon
                icon={item.icon}
                width="28"
                height="28"
                class="group-hover:text-neutral"
              />
              {#if isExpanded}<span class="ml-2">{item.label}</span>{/if}
            </a>
          </li>
        {/each}

        <li class="my-1 mt-auto">
          <a
            href="/account/sign_out"
            class="{hoverColor} flex items-center rounded-lg px-3 text-base"
          >
            <Icon
              icon="solar:logout-3-bold-duotone"
              width="28"
              height="28"
              class="group-hover:text-neutral"
            />
            {#if isExpanded}<span class="ml-2">Sign Out</span>{/if}
          </a>
        </li>
      </ul>
    </div>
  {/if}
</div>

<style>
  .menu :focus {
    background-color: theme("colors.neutral-content");
    color: theme("colors.neutral");
  }
</style>
