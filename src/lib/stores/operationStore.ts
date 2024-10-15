// src/stores/operationStore.ts
import { writable } from 'svelte/store';

export const operationStore = writable([]);
export const selectedOperationStore = writable(null);