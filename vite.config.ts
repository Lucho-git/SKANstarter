import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [sveltekit()],
    define: {
        'process.env.NODE_ENV': '"production"',
        '%PUBLIC_ONESIGNAL_APP_ID%': JSON.stringify(process.env.PUBLIC_ONESIGNAL_APP_ID)
    },
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
});
