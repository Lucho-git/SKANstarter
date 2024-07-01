

export const index = 30;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(marketing)/login/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/30.5e025424.js","_app/immutable/chunks/scheduler.ccf898a6.js","_app/immutable/chunks/index.7272c3b3.js"];
export const stylesheets = [];
export const fonts = [];
