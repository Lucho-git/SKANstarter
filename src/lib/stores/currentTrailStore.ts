// $lib/stores/currentTrailStore.ts
import { writable } from 'svelte/store';

export interface Coordinate {
    longitude: number;
    latitude: number;
    timestamp: number;
}

export interface Trail {
    id: string;
    startTime: string;
    endTime: string | null;
    color: string;
    width: number;
    vehicle_id: string;
    operation_id: string;
    path: Coordinate[];
}

function createCurrentTrailStore() {
    const { subscribe, set, update } = writable<Trail | null>(null);

    return {
        subscribe,
        set,
        update,
        reset: () => set(null),
        setEndTime: (endTime: string) => update(trail => trail ? { ...trail, endTime } : null),
        addCoordinate: (coord: Coordinate) => update(trail => {
            if (trail) {
                return { ...trail, path: [...trail.path, coord] };
            }
            return trail;
        }),
    };
}

function createCoordinateBufferStore() {
    const { subscribe, set, update } = writable<Coordinate[]>([]);

    return {
        subscribe,
        set,
        update,
        add: (coord: Coordinate) => update(coords => [...coords, coord]),
        clear: () => set([]),
    };
}

export const currentTrailStore = createCurrentTrailStore();
export const coordinateBufferStore = createCoordinateBufferStore();