// src/stores/userStore.ts
import { writable } from 'svelte/store';

interface UserStore {
    id: string | null;
    email: string | null;
    fullName: string | null;
    companyName: string | null;
    website: string | null;
}

const createUserStore = () => {
    const { subscribe, set, update } = writable<UserStore>({
        id: null,
        email: null,
        fullName: null,
        companyName: null,
        website: null
    });

    return {
        subscribe,
        setUser: (userData: Partial<UserStore>) => update(user => ({ ...user, ...userData })),
        clearUser: () => set({ id: null, email: null, fullName: null, companyName: null, website: null })
    };
};

export const userStore = createUserStore();
