import { readable } from 'svelte/store';

const getScreenSize = () => window.matchMedia('(min-width: 1024px)').matches ? 'lg' : 'sm';

export const screenSize = readable('sm', set => {
    if (typeof window !== 'undefined') {
        const updateSize = () => {
            const newSize = getScreenSize();
            set(newSize);
            console.log('Screen size changed:', newSize);
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }
});
