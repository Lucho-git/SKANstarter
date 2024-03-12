import { writable } from 'svelte/store';

export const userFilesStore = writable<string[]>([]);
