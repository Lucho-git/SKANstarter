<script lang="ts">
  import { page } from "$app/stores"
  import { postList } from "./../posts.json"
  import { goto } from "$app/navigation"

  let currentPost: Post | null = null
  for (const post of postList) {
    if (
      $page.url.pathname == post.link ||
      $page.url.pathname == post.link + "/"
    ) {
      currentPost = post
      continue
    }
  }
  if (currentPost != null) {
    let dateParts = currentPost.date.split("-")
    currentPost.parsedDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
    ) // Note: months are 0-based
  } else {
    console.log(
      "WARNING: rendering features post, which is not listed in posts.json",
    )
  }

  function goBack() {
    goto("/features")
  }
</script>

<svelte:head>
  <title>{currentPost?.title ? currentPost.title : "Not Found"}</title>
  <meta
    name="description"
    content={currentPost?.description
      ? currentPost.description
      : "features post"}
  />
</svelte:head>

<div class="py-12 px-6 font-sans">
  <article class="prose mx-auto">
    <button class="btn btn-primary mb-6" on:click={goBack}>
      &larr; Back to Features
    </button>
    {#if currentPost == null}
      <h1>Post not found</h1>
    {:else}
      <div class="text-sm text-accent">
        {currentPost.parsedDate?.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <h1>{currentPost.title}</h1>
      <slot />
    {/if}
  </article>
</div>
