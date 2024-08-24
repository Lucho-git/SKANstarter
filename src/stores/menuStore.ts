import { writable } from 'svelte/store';

export const menuStore = writable({
    showGenerateModal: false,
    showConnectModal: false,
    showDeleteConfirmation: false,
    showSettingsModal: false,
    showRenameModal: false
});
