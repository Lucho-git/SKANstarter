// deviceStore.js
import { writable } from 'svelte/store';

const isMobile = writable(false);

const createDeviceStore = () => {
  const { subscribe, set } = isMobile;

  const breakpoint = 768; // Adjust this value to your desired breakpoint

  const updateInnerWidth = (width) => {
    set(width < breakpoint);
  };

  return {
    subscribe,
    updateInnerWidth,
  };
};

export const deviceStore = createDeviceStore();