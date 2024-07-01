import * as server from '../entries/pages/(marketing)/login/forgot_password/_page.server.ts.js';

export const index = 32;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(marketing)/login/forgot_password/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(marketing)/login/forgot_password/+page.server.ts";
export const imports = ["_app/immutable/nodes/32.84f9fa7e.js","_app/immutable/chunks/scheduler.ccf898a6.js","_app/immutable/chunks/index.7272c3b3.js","_app/immutable/chunks/login_config.09e6ce4d.js","_app/immutable/chunks/spread.8a54911c.js","_app/immutable/chunks/each.34974530.js"];
export const stylesheets = ["_app/immutable/assets/login_config.0a15a45c.css"];
export const fonts = [];
