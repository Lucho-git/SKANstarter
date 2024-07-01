import * as server from '../entries/pages/(admin)/account/(menu)/_page.server.ts.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(admin)/account/(menu)/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(admin)/account/(menu)/+page.server.ts";
export const imports = ["_app/immutable/nodes/8.7a88a87a.js","_app/immutable/chunks/scheduler.ccf898a6.js","_app/immutable/chunks/index.7272c3b3.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/paths.d8f4387a.js","_app/immutable/chunks/each.34974530.js","_app/immutable/chunks/stores.54c459da.js","_app/immutable/chunks/singletons.5b14b65b.js","_app/immutable/chunks/supabaseClient.5a6af499.js","_app/immutable/chunks/index.38921fa9.js","_app/immutable/chunks/public.d2f41676.js","_app/immutable/chunks/v4.4a60fe23.js"];
export const stylesheets = ["_app/immutable/assets/8.26150e02.css","_app/immutable/assets/index.798bbb7e.css"];
export const fonts = [];
