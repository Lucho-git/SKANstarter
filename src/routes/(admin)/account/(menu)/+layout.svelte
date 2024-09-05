<script lang="ts">
  import { page } from "$app/stores"
  import "../../../../app.css"
  import { writable } from "svelte/store"
  import { setContext } from "svelte"
  import icons from "$lib/icons"
  import Icon from "@iconify/svelte"

  const adminSectionStore = writable("")
  setContext("adminSection", adminSectionStore)
  let adminSection: string
  adminSectionStore.subscribe((value) => {
    adminSection = value
  })

  function closeDrawer(): void {
    const adminDrawer = document.getElementById(
      "admin-drawer",
    ) as HTMLInputElement
    adminDrawer.checked = false
  }

  const selectedColor = "bg-neutral"
  const activeColor = "bg-neutral-content bg-opacity-10 text-neutral-content"
  const hoverColor = "hover:bg-neutral-content hover:text-neutral group"
</script>

<div class="drawer lg:drawer-open">
  <input id="admin-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <div class="navbar bg-base-100 lg:hidden">
      <div class="flex-1">
        <a class="content-black btn btn-ghost text-xl normal-case" href="/">
          SKAN Farming
        </a>
      </div>
      <div class="flex-none">
        <div class="dropdown dropdown-end">
          <label for="admin-drawer" class="btn btn-circle btn-ghost">
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
        </div>
      </div>
    </div>
    <div class="container px-6 py-3 lg:px-12 lg:py-6">
      <slot />
    </div>
  </div>

  {#if !$page.url.pathname.includes("/account/mapviewer")}
    <div class="drawer-side" style="z-index: 30;">
      <label for="admin-drawer" class="drawer-overlay" />
      <ul
        class="menu menu-lg min-h-full w-80 {selectedColor} p-4 text-neutral-content lg:border-r"
      >
        <li>
          <div
            class="menu-title flex flex-row px-4 py-2 text-xl font-bold normal-case text-neutral-content"
          >
            <a href="/" class="grow">SKAN Farming</a>
            <label for="admin-drawer" class="ml-3 lg:hidden"> &#x2715; </label>
          </div>
        </li>
        <li class="my-1">
          <a
            href="/account"
            class="{adminSection === 'home'
              ? activeColor
              : ''} {hoverColor} flex items-center rounded-lg px-4"
            on:click={closeDrawer}
          >
            <Icon
              icon="solar:home-bold-duotone"
              width="28"
              height="28"
              class="mr-2 group-hover:text-neutral"
            />
            <span>Home</span>
          </a>
        </li>
        <li class="my-1">
          <a
            href="/account/mapviewer"
            class="{adminSection === 'mapviewer'
              ? activeColor
              : ''} {hoverColor} flex items-center rounded-lg px-4"
            on:click={closeDrawer}
          >
            <Icon
              icon="solar:map-point-wave-bold-duotone"
              width="28"
              height="28"
              class="mr-2 group-hover:text-neutral"
            />
            <span>MapViewer</span>
          </a>
        </li>
        <li class="my-1">
          <a
            href="/account/fieldview"
            class="{adminSection === 'fieldview'
              ? activeColor
              : ''} {hoverColor} flex items-center rounded-lg px-4"
            on:click={closeDrawer}
          >
            <Icon
              icon="solar:map-bold-duotone"
              width="28"
              height="28"
              class="mr-2 group-hover:text-neutral"
            />
            <span>FieldView</span>
          </a>
        </li>
        <li class="my-1">
          <a
            href="/account/pathplanner"
            class="{adminSection === 'pathplanner'
              ? activeColor
              : ''} {hoverColor} flex items-center rounded-lg px-4"
            on:click={closeDrawer}
          >
            <Icon
              icon="solar:routing-2-bold-duotone"
              width="28"
              height="28"
              class="mr-2 group-hover:text-neutral"
            />
            <span>PathPlanner</span>
          </a>
        </li>
        <li class="my-1">
          <a
            href="/account/billing"
            class="{adminSection === 'billing'
              ? activeColor
              : ''} {hoverColor} flex items-center rounded-lg px-4"
            on:click={closeDrawer}
          >
            <Icon
              icon="solar:wallet-money-bold-duotone"
              width="28"
              height="28"
              class="mr-2 group-hover:text-neutral"
            />
            <span>Billing</span>
          </a>
        </li>
        <li class="my-1">
          <a
            href="/account/settings"
            class="{adminSection === 'settings'
              ? activeColor
              : ''} {hoverColor} flex items-center rounded-lg px-4"
            on:click={closeDrawer}
          >
            <Icon
              icon="solar:settings-bold-duotone"
              width="28"
              height="28"
              class="mr-2 group-hover:text-neutral"
            />
            <span>Settings</span>
          </a>
        </li>
        <li class="my-1 mt-auto">
          <a
            href="/account/sign_out"
            class="{hoverColor} flex items-center rounded-lg px-4 text-base"
          >
            <Icon
              icon="solar:logout-3-bold-duotone"
              width="28"
              height="28"
              class="mr-2 group-hover:text-neutral"
            />
            <span>Sign Out</span>
          </a>
        </li>
      </ul>
    </div>
  {/if}
</div>
