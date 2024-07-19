import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';
import * as child_process from 'node:child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            runtime: 'nodejs18.x'
        }),
        version: {
            name: child_process.execSync('git rev-parse HEAD').toString().trim(),
            pollInterval: 60000 // Check for updates every minute
        }
    },
    preprocess: vitePreprocess()
};

export default config;
