import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import { screenSize } from './screenSizeStore';

export const mobileChat = writable(false);

function createCrispVisibilityStore() {
    if (browser) {
        return derived(
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
    }

    // Return a dummy store for server-side rendering
    return writable(false);
}

export const crispVisibility = createCrispVisibilityStore();

if (browser) {
    crispVisibility.subscribe(value => {
        console.log('Crisp visibility changed:', value);
    });
}
