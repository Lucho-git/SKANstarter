// menuStore.ts
import { writable } from 'svelte/store';

export const menuStore = writable({
    showGenerateModal: false,
    showConnectModal: false,
    showDeleteConfirmationModal: false,
    showSettingsModal: false,
    showRenameModal: false,
    showMapCarouselModal: false  // Add this new property
});