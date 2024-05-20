import { writable } from 'svelte/store';

export const controlStore = writable({
    showMarkerMenu: false,
  });