import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import svelteSVG from 'vite-plugin-svelte-svg';

export default defineConfig({
    plugins: [sveltekit(), svelteSVG({
        svgoConfig: {}, // See https://github.com/svg/svgo#configuration
        requireSuffix: false, // Set to true to only import files ending in .svg?component
    })],
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
});
