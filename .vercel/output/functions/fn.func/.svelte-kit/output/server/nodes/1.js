

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.29f5261d.js","_app/immutable/chunks/scheduler.ccf898a6.js","_app/immutable/chunks/index.7272c3b3.js","_app/immutable/chunks/stores.54c459da.js","_app/immutable/chunks/singletons.5b14b65b.js","_app/immutable/chunks/paths.d8f4387a.js"];
export const stylesheets = ["_app/immutable/assets/app.927f3d6a.css"];
export const fonts = [];
