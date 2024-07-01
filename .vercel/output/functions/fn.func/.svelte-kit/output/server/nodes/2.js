import * as universal from '../entries/pages/(admin)/account/_layout.ts.js';
import * as server from '../entries/pages/(admin)/account/_layout.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(admin)/account/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/(admin)/account/+layout.ts";
export { server };
export const server_id = "src/routes/(admin)/account/+layout.server.ts";
export const imports = ["_app/immutable/nodes/2.df9fc5f8.js","_app/immutable/chunks/_layout.78544974.js","_app/immutable/chunks/public.d2f41676.js","_app/immutable/chunks/index.408052cc.js","_app/immutable/chunks/index.38921fa9.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/control.c2cf8273.js","_app/immutable/chunks/scheduler.ccf898a6.js","_app/immutable/chunks/index.7272c3b3.js","_app/immutable/chunks/navigation.58f74453.js","_app/immutable/chunks/singletons.5b14b65b.js","_app/immutable/chunks/paths.d8f4387a.js"];
export const stylesheets = [];
export const fonts = [];
