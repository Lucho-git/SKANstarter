import * as server from '../entries/pages/(marketing)/_layout.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(marketing)/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/(marketing)/+layout.server.ts";
export const imports = ["_app/immutable/nodes/4.b83cd9c8.js","_app/immutable/chunks/scheduler.ccf898a6.js","_app/immutable/chunks/index.7272c3b3.js","_app/immutable/chunks/paths.d8f4387a.js"];
export const stylesheets = ["_app/immutable/assets/4.0066f181.css","_app/immutable/assets/app.927f3d6a.css"];
export const fonts = [];
