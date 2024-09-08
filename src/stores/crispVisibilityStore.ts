// stores/crispVisibilityStore.ts
import { writable } from 'svelte/store';

import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { screenSize } from './screenSizeStore';

export const mobileChat = writable(false);


export const crispVisibility = derived(
    [page, screenSize, mobileChat],
    ([$page, $screenSize, $mobileChat]) => {
        const hiddenPaths = ['/account/settings', '/account/mapviewer'];

        if ($screenSize === 'lg') {
            return !hiddenPaths.some(path => $page.url?.pathname?.startsWith(path) ?? false);
        } else {
            return $mobileChat;
        }
    }
);


// Log changes
crispVisibility.subscribe(value => {
    console.log('Crisp visibility changed:', value);
});

