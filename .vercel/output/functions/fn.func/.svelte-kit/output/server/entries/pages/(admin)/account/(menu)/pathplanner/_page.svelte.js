import { c as create_ssr_component, o as onDestroy, d as add_attribute, j as getContext, v as validate_component } from "../../../../../../chunks/ssr.js";
import "../../../../../../chunks/user.js";
import "../../../../../../chunks/supabaseClient.js";
import "mapbox-gl";
import "../../../../../../chunks/MapViewer.svelte_svelte_type_style_lang.js";
import "../../../../../../chunks/SvelteToast.svelte_svelte_type_style_lang.js";
const FarmDataAnimation_svelte_svelte_type_style_lang = "";
const FarmDataGSAP_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: '.animation-wrapper.svelte-sfludt{width:100%;height:0;padding-bottom:66.67%;position:relative;overflow:hidden}#animation-container.svelte-sfludt{border:2px solid black;position:absolute;top:0;left:0;width:100%;height:100%;transform-origin:top left;transition:transform 0.3s ease}.controls.svelte-sfludt{border:2px solid black;padding:10px;text-align:center;width:100%;box-sizing:border-box;margin-top:-1px}.play-pause-restart[data-state="play"].svelte-sfludt::before{content:"▶️"}.play-pause-restart[data-state="pause"].svelte-sfludt::before{content:"⏸"}.play-pause-restart[data-state="restart"].svelte-sfludt::before{content:"🔁"}.relative.svelte-sfludt::after{content:"";position:absolute;bottom:0;left:0;right:0;height:2px;background-color:black}.full-width.svelte-sfludt{display:flex;flex-direction:column;width:100%;height:90vh}',
  map: null
};
const zoomFactor = 0.1;
const FarmDataGSAP = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let animationContainer;
  let animationSvg;
  let progress = 0;
  let buttonState = "Pause";
  let scale = 1;
  onDestroy(() => {
    animationContainer.removeEventListener("wheel", handleWheel);
    removeEventListener("animationprogress", (event) => {
      progress = event.detail;
    });
    animationSvg.innerHTML = "";
  });
  function handleWheel(event) {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 1 : -1;
    scale += delta * zoomFactor;
    scale = Math.max(0.5, Math.min(scale, 2));
    animationSvg.style.transform = `scale(${scale})`;
  }
  $$result.css.add(css$1);
  return `<div class="full-width mx-auto svelte-sfludt"><div class="flex flex-row"><div class="w-5/6 flex flex-col"> <div class="animation-wrapper flex-grow svelte-sfludt"><div id="animation-container" class="svelte-sfludt"${add_attribute("this", animationContainer, 0)}><svg id="animation-svg" width="100%" height="100%"${add_attribute("this", animationSvg, 0)}></svg></div></div>  <div class="controls mt-4 svelte-sfludt"><button data-svelte-h="svelte-dbuqjm">↺</button> <button class="play-pause-restart ml-2 mr-2 svelte-sfludt"${add_attribute("data-state", buttonState.toLowerCase(), 0)}></button> <button data-svelte-h="svelte-l0lyy5">↻</button> <input class="ml-2" type="range" min="0" max="1" step="0.001"${add_attribute("value", progress, 0)}></div></div> <div class="hidden md:block md:w-1/6 mt-8 md:mt-0 flex flex-col relative min-w-[160px] max-w-[200px] svelte-sfludt" data-svelte-h="svelte-1y58c7p"> <div class="card bg-base-100 rounded-none flex-grow overflow-y-auto border-2 border-black h-full -mb-1"><div class="card-body p-4"><div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="font-bold text-sm">Time</span></div> <div id="time" class="text-sm"><div class="badge badge-outline" id="date"></div> <br> <div class="badge badge-outline" id="hours"></div></div></div> <div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg> <span class="font-bold text-sm">Crop</span></div> <div class="badge badge-outline" id="crop"></div></div> <div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> <span class="font-bold text-sm">Applied Rate</span></div> <div class="badge badge-outline" id="appliedRate"></div></div> <div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg> <span class="font-bold text-sm">Swath Width</span></div> <div class="badge badge-outline" id="swathWidth"></div></div> <div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <span class="font-bold text-sm">Heading</span></div> <div class="badge badge-outline" id="heading"></div></div> <div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> <span class="font-bold text-sm">Target Rate</span></div> <div class="badge badge-outline" id="targetRate"></div></div> <div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg> <span class="font-bold text-sm">Variety</span></div> <div class="badge badge-outline" id="variety"></div></div> <div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg> <span class="font-bold text-sm">Machine</span></div> <div class="badge badge-outline" id="machine"></div></div> <div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg> <span class="font-bold text-sm">Fuel</span></div> <div class="badge badge-outline" id="fuel"></div></div> <div class="mb-2"><div class="flex items-center"><svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> <span class="font-bold text-sm">Vehicle Speed</span></div> <div class="badge badge-outline" id="vehicleSpeed"></div></div></div></div> <div class="border-t-2 border-black"></div></div></div> </div>`;
});
const StubContainer_svelte_svelte_type_style_lang = "";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".app-container.svelte-tb1q46{display:flex;width:100%;height:100vh}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let adminSection = getContext("adminSection");
  adminSection.set("pathplanner");
  $$result.css.add(css);
  return `    <div class="app-container svelte-tb1q46">${validate_component(FarmDataGSAP, "FarmDataGsap").$$render($$result, {}, {}, {})} </div>`;
});
export {
  Page as default
};
