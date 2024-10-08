// src/lib/stores/homeBoundaryStore.ts
import { writable } from 'svelte/store';

export const fieldBoundaryStore = writable<[number, number, number, number] | null>(null);
export const markerBoundaryStore = writable<[number, number, number, number] | null>(null);