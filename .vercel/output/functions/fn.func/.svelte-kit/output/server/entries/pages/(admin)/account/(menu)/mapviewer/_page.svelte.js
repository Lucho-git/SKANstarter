import { c as create_ssr_component, b as subscribe, h as createEventDispatcher, f as escape, s as setContext, o as onDestroy, d as add_attribute, j as getContext, v as validate_component } from "../../../../../../chunks/ssr.js";
import "mapbox-gl";
import { u as userVehicleTrailing } from "../../../../../../chunks/MapViewer.svelte_svelte_type_style_lang.js";
import { w as writable } from "../../../../../../chunks/index2.js";
import "../../../../../../chunks/supabaseClient.js";
import "../../../../../../chunks/SvelteToast.svelte_svelte_type_style_lang.js";
const trailDataLoaded = writable(false);
const vehicleDataLoaded = writable(false);
const ButtonSection = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $userVehicleTrailing, $$unsubscribe_userVehicleTrailing;
  $$unsubscribe_userVehicleTrailing = subscribe(userVehicleTrailing, (value) => $userVehicleTrailing = value);
  let { isSatelliteView = true } = $$props;
  createEventDispatcher();
  const vehicleTypes = ["tractor", "combine", "loader", "pointer", "Harvester"];
  let currentVehicleIndex = 0;
  const colorSizeOptions = [
    { color: "red", size: "25px" },
    { color: "blue", size: "35px" },
    { color: "green", size: "45px" },
    { color: "yellow", size: "60px" }
  ];
  let currentColorSizeIndex = 0;
  const antLineConfigModes = ["noTrails", "allTrails", "latestTrail", "userLatestTrail"];
  let currentAntLineConfigIndex = 0;
  if ($$props.isSatelliteView === void 0 && $$bindings.isSatelliteView && isSatelliteView !== void 0)
    $$bindings.isSatelliteView(isSatelliteView);
  $$unsubscribe_userVehicleTrailing();
  return `  <div>  <button class="btn btn-circle btn-lg bg-white bg-opacity-50 hover:bg-opacity-100 absolute top-4 left-4 z-10" data-svelte-h="svelte-1cawvwb"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg></button>  <button class="btn btn-circle btn-md absolute top-4 right-4 z-10">${isSatelliteView ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clip-rule="evenodd"></path></svg>`}</button>  <button class="btn btn-circle btn-md absolute top-20 right-4 z-10">${escape(vehicleTypes[currentVehicleIndex])} </button> <button class="btn btn-circle btn-md absolute top-20 right-20 z-10">     ${escape(colorSizeOptions[currentColorSizeIndex].color)} ${escape(colorSizeOptions[currentColorSizeIndex].size)}</button>   <button class="btn btn-circle btn-md absolute top-36 right-4 z-10">${$userVehicleTrailing ? `<div class="flex flex-col -mt-7 pb-0">${``}</div>` : `<svg fill="#000000" width="30px" height="30px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>trail</title><path d="M30.165 30.887c-1.604 0.076-21.522-0.043-21.522-0.043-12.101-12.151 18.219-16.173-0.521-26.154l-1.311 1.383-1.746-4.582 5.635 0.439-1.128 1.267c23.438 6.83-3.151 19.631 20.594 27.69v0z"></path></svg>`}</button> <button class="btn btn-circle btn-md absolute top-52 right-4 z-10 text-xs">${escape(antLineConfigModes[currentAntLineConfigIndex])}</button> </div>`;
});
const css = {
  code: ".map-container.svelte-1s99y2r{position:absolute;top:0;bottom:0;left:0;width:100%;height:100%}",
  map: null
};
const MapViewer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_vehicleDataLoaded;
  let $$unsubscribe_trailDataLoaded;
  $$unsubscribe_vehicleDataLoaded = subscribe(vehicleDataLoaded, (value) => value);
  $$unsubscribe_trailDataLoaded = subscribe(trailDataLoaded, (value) => value);
  let mapContainer;
  let map;
  setContext("map", { getMap: () => Promise.resolve(map) });
  onDestroy(() => {
    console.log("DestroyingMap");
  });
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="map-container svelte-1s99y2r"${add_attribute("this", mapContainer, 0)}>${``} </div>`;
  } while (!$$settled);
  $$unsubscribe_vehicleDataLoaded();
  $$unsubscribe_trailDataLoaded();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let adminSection = getContext("adminSection");
  adminSection.set("mapviewer");
  return `  <div class="fixed top-0 left-0 w-full h-full overflow-hidden">${validate_component(MapViewer, "MapViewer").$$render($$result, {}, {}, {})} ${validate_component(ButtonSection, "ButtonSection").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
