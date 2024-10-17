// $lib/stores/currentTrailStore.ts
import { writable } from 'svelte/store';

export interface Trail {
    id: string;
    startTime: string;
    endTime: string | null;
    color: string;
    width: number;
    vehicle_id: string;
    operation_id: string;
    path?: any; // You might want to define a more specific type for the path
}

function createCurrentTrailStore() {
    const { subscribe, set, update } = writable<Trail | null>(null);

    return {
        subscribe,
        set,
        update,
        reset: () => set(null),
        setEndTime: (endTime: string) => update(trail => trail ? { ...trail, endTime } : null),
    };
}

export const currentTrailStore = createCurrentTrailStore();