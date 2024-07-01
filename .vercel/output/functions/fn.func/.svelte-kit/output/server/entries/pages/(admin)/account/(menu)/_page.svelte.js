import { c as create_ssr_component, h as createEventDispatcher, v as validate_component, b as subscribe, e as each, f as escape, j as getContext } from "../../../../../chunks/ssr.js";
import { w as writable } from "../../../../../chunks/index2.js";
import { p as page } from "../../../../../chunks/stores.js";
import "../../../../../chunks/supabaseClient.js";
const userFilesStore = writable([]);
function isValidFile(file2) {
  const validExtensions = [".zip", ".kml", ".isoxml", ".xml"];
  const fileExtension = file2.name.toLowerCase().slice(file2.name.lastIndexOf("."));
  return validExtensions.includes(fileExtension);
}
const FileInspector = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { file } = $$props;
  const dispatch = createEventDispatcher();
  function validateFile() {
    if (isValidFile(file)) {
      dispatch("validFile", { file });
    } else {
      dispatch("invalidFile", { file });
    }
  }
  if ($$props.file === void 0 && $$bindings.file && file !== void 0)
    $$bindings.file(file);
  {
    if (file) {
      validateFile();
    }
  }
  return ``;
});
const FileUpload_svelte_svelte_type_style_lang = "";
const css = {
  code: "@media(max-width: 640px){.fullscreen-modal.svelte-1e8mk0g{position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);width:calc(100% - 32px);max-height:calc(100% - 16px);overflow-y:auto;border-radius:8px}}",
  map: null
};
const FileUpload = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isPopoverOpen = false } = $$props;
  let file = null;
  createEventDispatcher();
  if ($$props.isPopoverOpen === void 0 && $$bindings.isPopoverOpen && isPopoverOpen !== void 0)
    $$bindings.isPopoverOpen(isPopoverOpen);
  $$result.css.add(css);
  return `  ${isPopoverOpen ? `<div class="fixed inset-0 z-50"><div class="overlay absolute inset-0 bg-black opacity-50"></div> <div class="card w-full max-w-3xl bg-base-100 shadow-xl z-10 mx-auto fullscreen-modal svelte-1e8mk0g"><div class="card-body relative"><button class="btn btn-sm btn-circle absolute top-2 right-2" data-svelte-h="svelte-101rc4g"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button> <h3 class="card-title justify-center text-2xl font-bold mb-4" data-svelte-h="svelte-1ifn8g3">Upload Files</h3> <h3 class="card-title justify-center text-lg mb-4" data-svelte-h="svelte-squgt5">Upload your farms paddock boundary files</h3> <div class="flex flex-col items-center justify-center w-full max-w-7xl mx-auto"><label for="dropzone-file" class="flex flex-col items-center justify-center w-3/4 h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">${`${`<div class="flex flex-col items-center justify-center pt-5 pb-6">${``} <p class="mb-2 text-sm text-gray-500 dark:text-gray-400" data-svelte-h="svelte-1mmujl8"><span class="font-semibold">Click to upload</span> or drag and
                  drop</p> <p class="text-xs text-gray-500 dark:text-gray-400" data-svelte-h="svelte-10predt">ZIP, ISOXML or .KML files (Max: 50mb)</p></div>`}`} <input id="dropzone-file" type="file" class="hidden"></label> <button class="${[
    "btn mt-4",
    "bg-gray-400   opacity-50"
  ].join(" ").trim()}" ${"disabled"}>${`Upload File`}</button></div> <div class="justify-center mx-auto">${``} ${``} ${``}</div> <div class="mt-2 max-w-6xl mx-auto" data-svelte-h="svelte-xkpt54"><h3 class="text-lg font-bold mb-2">File Upload Requirements</h3> <ul class="list-none pl-6 mb-4"><li class="mb-2"><span class="inline-block w-4 h-4 mr-2"><i class="at-check-circle-bold"></i></span>
              Zipped Shapefiles, .KML files and ISOXML files are all accepted</li> <li class="mb-2"><span class="inline-block w-4 h-4 mr-2"><i class="at-check-circle-bold"></i></span>
              Shapefile ZIP must contain .dbf, .shx and .shp files.</li> <li class="mb-2"><span class="inline-block w-4 h-4 mr-2"><i class="at-check-circle-bold"></i></span>
              Multiple ZIP files or an ISOXML can be contained in a single ZIP file.</li> <li><span class="inline-block w-4 h-4 mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"></path></svg></span> <a href="docs/skan_sample_shapefile.zip" class="text-blue-500 hover:text-blue-700 underline">Download Example Paddock
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></a></li></ul> <h3 class="text-lg font-bold mb-2">Supported Polygon Types</h3> <ul class="list-none pl-6"><li class="mb-2"><span class="inline-block w-4 h-4 mr-2"><i class="at-check-circle-bold"></i></span>
              Polygon</li> <li><span class="inline-block w-4 h-4 mr-2"><i class="at-check-circle-bold"></i></span>
              Multipolygon</li></ul></div> ${validate_component(FileInspector, "FileInspector").$$render($$result, { file }, {}, {})}</div></div></div>` : ``}`;
});
const UploadPopoverTrigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isPopoverOpen = false;
  return `  <div class="my-2"><button class="btn btn-primary" data-svelte-h="svelte-13c8ukm">Upload File</button> ${validate_component(FileUpload, "FileUpload").$$render($$result, { isPopoverOpen }, {}, {})}</div>`;
});
const UserFiles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let userFiles;
  let $userFilesStore, $$unsubscribe_userFilesStore;
  $$unsubscribe_userFilesStore = subscribe(userFilesStore, (value) => $userFilesStore = value);
  createEventDispatcher();
  function truncateFileName(fileName) {
    return fileName;
  }
  userFiles = $userFilesStore;
  $$unsubscribe_userFilesStore();
  return `<div class="my-6"><h1 class="text-xl font-bold mb-1" data-svelte-h="svelte-1mht8ki">Uploaded Files</h1> ${userFiles.length === 0 ? `<p data-svelte-h="svelte-ua8t8w">No files uploaded yet.</p>` : `<ul>${each(userFiles, (file) => {
    return `<li class="flex items-center justify-between"><span>${escape(truncateFileName(file))}</span> <button class="btn btn-sm btn-error" data-svelte-h="svelte-19xgv8e">Delete</button> </li>`;
  })}</ul>`}</div> ${``}`;
});
const FloatingChat = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe_page();
  return `<div class="fixed bottom-8 right-8 z-50"><button class="btn btn-circle btn-lg btn-primary" data-svelte-h="svelte-9gwy8j"></button> ${``}</div>`;
});
const MasterMapManager = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe_page();
  return `<div class="alert alert-info w-full mt-2"><div class="px-4 py-2"><div class="font-bold text-center mb-4" data-svelte-h="svelte-1aage3m">Selected Map</div> ${`<div class="my-2 text-center" data-svelte-h="svelte-121ptqh"><p>No map assigned.</p></div> <div class="flex flex-col sm:flex-row sm:justify-center mt-4"><button class="btn btn-primary mb-2 sm:mb-0 sm:mr-2" data-svelte-h="svelte-1jlzvsp">Generate New Map</button> <button class="btn btn-secondary" data-svelte-h="svelte-139kn95">Connect to Existing Map</button></div>`}</div></div> ${``} ${``} ${``} ${``}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  let adminSection = getContext("adminSection");
  adminSection.set("home");
  console.log("Account Parent component mounted");
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-hq06ji_START -->${$$result.title = `<title>Account</title>`, ""}<!-- HEAD_svelte-hq06ji_END -->`, ""} <div class="flex flex-col lg:flex-row lg:space-x-4"><div class="lg:w-1/2">${validate_component(MasterMapManager, "MasterMapManager").$$render($$result, {}, {}, {})}</div> <div class="lg:w-1/2"><div class="alert alert-success w-full mt-2"><img src="/images/file-upload-icon.svg" alt="Gear" class="w-14 h-14"> <div><div class="font-bold" data-svelte-h="svelte-1cir21x">Upload Paddock Boundaries</div> <div class="my-2">${validate_component(UploadPopoverTrigger, "UploadPopoverTrigger").$$render($$result, {}, {}, {})}</div> <div class="my-2"></div></div></div> <div class="alert alert-success w-full mt-2"><div><div class="font-bold" data-svelte-h="svelte-11l4quw">User Files</div> <div class="my-2">${validate_component(UserFiles, "UserFiles").$$render($$result, {}, {}, {})}</div> <div class="my-2"></div></div></div></div></div> ${validate_component(FloatingChat, "FloatingChat").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
