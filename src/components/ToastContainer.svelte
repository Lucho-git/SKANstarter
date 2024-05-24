<div class="toast-container">
  <slot />
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
  }
</style>
