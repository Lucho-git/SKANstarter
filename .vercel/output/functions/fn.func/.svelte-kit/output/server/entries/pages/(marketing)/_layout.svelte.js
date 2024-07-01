import { c as create_ssr_component, d as add_attribute, b as subscribe, v as validate_component, f as escape } from "../../../chunks/ssr.js";
/* empty css                   */import { w as writable } from "../../../chunks/index2.js";
const LogoCard_svelte_svelte_type_style_lang = "";
const css = {
  code: '.font-archivo.svelte-54sohi{font-family:"Archivo", Arial, sans-serif}',
  map: null
};
const LogoCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { href = "/" } = $$props;
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  $$result.css.add(css);
  return `<div class="flex-1"><a${add_attribute("href", href, 0)} class="inline-block mt-4"><div class="card card-side bg-secondary shadow-md hover:bg-secondary-focus rounded-3xl" data-svelte-h="svelte-3ugwi1"><div class="card-body flex flex-row"><div class="flex items-center pl-0"><div class="w-16 h-16 flex justify-center items-center"><img src="/images/gear_2.svg" alt="Gear" class="max-w-full max-h-full"></div></div> <div class="flex-1 text-secondary-content"><div class="card-title font-black font-archivo text-4xl svelte-54sohi">SKAN</div> <p class="font-medium text-base whitespace-nowrap">Farming Logistics</p></div></div></div></a> </div>`;
});
const FloatingContact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `  <div class="fixed bottom-8 right-8 z-50"><button class="btn btn-circle btn-lg btn-primary" data-svelte-h="svelte-13c35hv"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></button> ${``}</div>`;
});
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="flex-grow"></div> <div class="bg-base-200" data-svelte-h="svelte-1kmaedt"><div class="border-t max-w-[1000px] mx-auto"></div> <footer class="footer p-16 gap-x-48 lg:gap-x-64 xl:gap-x-96 place-content-center text-base text-base-content"><nav class="flex justify-center items-center pt-3"><div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 1280 1278" class="fill-current mr-4"><g transform="translate(0.000000,1278.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none"><path d="M7235 12766 c-16 -8 -42 -26 -56 -42 -14 -16 -153 -267 -309 -559
                  -156 -291 -298 -553 -316 -582 -53 -84 -49 -83 -328 -94 l-247 -11 -53 26
                  c-53 26 -59 34 -416 549 -200 287 -373 536 -386 553 -29 39 -80 64 -132 64
                  -43 0 -1174 -376 -1213 -403 -58 -41 -70 -89 -59 -235 24 -296 71 -892 81
                  -1029 l12 -153 -29 -57 c-28 -55 -38 -64 -234 -200 -113 -78 -221 -147 -240
                  -153 -82 -24 -92 -21 -736 246 -661 274 -642 267 -720 232 -38 -18 -781 -942
                  -796 -990 -8 -29 -8 -48 0 -77 8 -25 152 -223 402 -552 338 -446 391 -521 401
                  -564 14 -65 14 -65 -116 -375 -115 -277 -141 -316 -219 -344 -23 -8 -324 -66
                  -671 -128 -660 -118 -663 -119 -707 -179 -52 -70 -181 -1268 -139 -1293 6 -4
                  293 -110 637 -236 344 -126 640 -238 657 -248 66 -38 81 -81 141 -413 31 -169
                  56 -328 56 -355 0 -31 -9 -65 -23 -91 -15 -29 -167 -177 -492 -479 -259 -240
                  -479 -451 -490 -467 -13 -21 -19 -47 -18 -81 0 -46 25 -97 255 -544 141 -271
                  268 -506 283 -522 14 -15 45 -33 68 -39 39 -11 87 -2 667 129 654 148 677 151
                  750 117 39 -19 504 -499 532 -549 38 -70 36 -90 -66 -488 -235 -917 -230 -897
                  -217 -940 6 -22 22 -51 34 -65 12 -14 242 -149 511 -300 443 -249 494 -275
                  535 -275 27 0 59 8 76 18 17 11 230 222 475 471 245 249 461 461 482 471 73
                  39 93 37 459 -45 189 -42 355 -83 368 -92 69 -45 73 -54 286 -694 201 -603
                  207 -619 245 -653 22 -20 55 -38 77 -42 91 -17 658 19 1020 65 164 21 199 38
                  227 113 9 24 75 322 146 662 86 406 137 630 149 650 39 62 68 77 373 193 329
                  126 371 135 444 96 18 -10 248 -191 510 -403 263 -212 491 -393 508 -403 22
                  -13 45 -17 83 -14 51 3 62 11 349 228 583 441 638 484 657 511 11 14 22 48 24
                  75 5 44 -15 102 -227 658 -128 336 -235 626 -237 645 -10 69 13 112 173 332
                  86 117 166 224 178 236 35 39 95 65 151 64 27 0 326 -30 663 -67 l612 -66 43
                  19 c23 11 50 28 60 39 14 16 364 954 422 1131 22 65 8 120 -43 172 -20 21
                  -268 208 -551 416 -508 373 -514 378 -539 433 l-25 55 12 215 c16 281 18 294
                  55 348 30 43 53 56 613 337 321 161 590 299 599 306 22 19 54 85 54 112 0 42
                  -259 1217 -275 1248 -9 17 -32 41 -53 55 -42 27 1 24 -1013 89 -389 25 -396
                  27 -455 83 -43 41 -223 380 -230 434 -4 27 0 60 8 84 8 22 162 289 342 593
                  314 528 328 554 328 602 -1 27 -7 60 -14 74 -13 25 -850 884 -898 921 -15 12
                  -45 21 -80 23 l-57 4 -564 -313 c-310 -172 -582 -319 -604 -327 -69 -24 -114
                  -9 -300 95 -188 105 -208 120 -237 177 -26 50 -25 37 -49 751 -20 590 -21 611
                  -43 655 -37 75 36 53 -984 296 -172 40 -323 74 -335 74 -12 -1 -35 -7 -52 -14z
                  m-385 -2650 c275 -36 503 -87 740 -166 1259 -416 2223 -1500 2484 -2792 57
                  -283 70 -419 70 -748 1 -310 -4 -386 -45 -635 -192 -1169 -955 -2197 -2024
                  -2725 -405 -200 -755 -305 -1245 -372 -153 -21 -711 -17 -880 5 -874 119
                  -1636 499 -2230 1113 -849 878 -1212 2088 -990 3300 146 797 579 1558 1196
                  2103 609 537 1352 856 2169 930 151 14 608 6 755 -13z"></path></g></svg> <div class="flex flex-col text-center"><p class="font-bold text-sm">SKAN Farming Logistics Pty Ltd</p> <p class="text-sm text-black-500">Copyright © 2024 - ABN: 26 675 693 464</p> <p class="text-xs"></p></div></div></nav> <aside class="flex flex-col items-center justify-center"><div><div class="grid grid-flow-col gap-6"><a href="https://twitter.com/SKANfarming" target="_blank" rel="noopener noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" class="fill-current transition duration-300 ease-in-out hover:scale-110 hover:text-primary"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a> <a href="tel:+61439405248"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" class="fill-current transition duration-300 ease-in-out hover:scale-110 hover:text-primary"><path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"></path><path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z"></path></svg></a> <a href="mailto:ryan@skanfarming.com"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" class="fill-current transition duration-300 ease-in-out hover:scale-110 hover:text-primary"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z"></path></svg></a></div></div> <div class="mt-4"><nav class="footer-center grid grid-flow-col gap-4"><a class="link link-hover" href="/docs/terms_of_service.pdf" target="_blank">Terms of Service</a> <a class="link link-hover" href="/docs/SKAN-Privacy-Policy.pdf" target="_blank">Privacy Policy</a> <a class="link link-hover" href="/">Data Security</a></nav></div></aside></footer></div>`;
});
const Footer2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="flex-grow"></div> <div class="bg-base-200 rounded" data-svelte-h="svelte-10cskim"><div class="border-t max-w-[1000px] mx-auto"></div> <footer class="footer footer-center p-10 bg-base-200 text-base-content rounded"><div><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 1280 1278" class="fill-current"><g transform="translate(0.000000,1278.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none"><path d="M7235 12766 c-16 -8 -42 -26 -56 -42 -14 -16 -153 -267 -309 -559
          -156 -291 -298 -553 -316 -582 -53 -84 -49 -83 -328 -94 l-247 -11 -53 26
          c-53 26 -59 34 -416 549 -200 287 -373 536 -386 553 -29 39 -80 64 -132 64
          -43 0 -1174 -376 -1213 -403 -58 -41 -70 -89 -59 -235 24 -296 71 -892 81
          -1029 l12 -153 -29 -57 c-28 -55 -38 -64 -234 -200 -113 -78 -221 -147 -240
          -153 -82 -24 -92 -21 -736 246 -661 274 -642 267 -720 232 -38 -18 -781 -942
          -796 -990 -8 -29 -8 -48 0 -77 8 -25 152 -223 402 -552 338 -446 391 -521 401
          -564 14 -65 14 -65 -116 -375 -115 -277 -141 -316 -219 -344 -23 -8 -324 -66
          -671 -128 -660 -118 -663 -119 -707 -179 -52 -70 -181 -1268 -139 -1293 6 -4
          293 -110 637 -236 344 -126 640 -238 657 -248 66 -38 81 -81 141 -413 31 -169
          56 -328 56 -355 0 -31 -9 -65 -23 -91 -15 -29 -167 -177 -492 -479 -259 -240
          -479 -451 -490 -467 -13 -21 -19 -47 -18 -81 0 -46 25 -97 255 -544 141 -271
          268 -506 283 -522 14 -15 45 -33 68 -39 39 -11 87 -2 667 129 654 148 677 151
          750 117 39 -19 504 -499 532 -549 38 -70 36 -90 -66 -488 -235 -917 -230 -897
          -217 -940 6 -22 22 -51 34 -65 12 -14 242 -149 511 -300 443 -249 494 -275
          535 -275 27 0 59 8 76 18 17 11 230 222 475 471 245 249 461 461 482 471 73
          39 93 37 459 -45 189 -42 355 -83 368 -92 69 -45 73 -54 286 -694 201 -603
          207 -619 245 -653 22 -20 55 -38 77 -42 91 -17 658 19 1020 65 164 21 199 38
          227 113 9 24 75 322 146 662 86 406 137 630 149 650 39 62 68 77 373 193 329
          126 371 135 444 96 18 -10 248 -191 510 -403 263 -212 491 -393 508 -403 22
          -13 45 -17 83 -14 51 3 62 11 349 228 583 441 638 484 657 511 11 14 22 48 24
          75 5 44 -15 102 -227 658 -128 336 -235 626 -237 645 -10 69 13 112 173 332
          86 117 166 224 178 236 35 39 95 65 151 64 27 0 326 -30 663 -67 l612 -66 43
          19 c23 11 50 28 60 39 14 16 364 954 422 1131 22 65 8 120 -43 172 -20 21
          -268 208 -551 416 -508 373 -514 378 -539 433 l-25 55 12 215 c16 281 18 294
          55 348 30 43 53 56 613 337 321 161 590 299 599 306 22 19 54 85 54 112 0 42
          -259 1217 -275 1248 -9 17 -32 41 -53 55 -42 27 1 24 -1013 89 -389 25 -396
          27 -455 83 -43 41 -223 380 -230 434 -4 27 0 60 8 84 8 22 162 289 342 593
          314 528 328 554 328 602 -1 27 -7 60 -14 74 -13 25 -850 884 -898 921 -15 12
          -45 21 -80 23 l-57 4 -564 -313 c-310 -172 -582 -319 -604 -327 -69 -24 -114
          -9 -300 95 -188 105 -208 120 -237 177 -26 50 -25 37 -49 751 -20 590 -21 611
          -43 655 -37 75 36 53 -984 296 -172 40 -323 74 -335 74 -12 -1 -35 -7 -52 -14z
          m-385 -2650 c275 -36 503 -87 740 -166 1259 -416 2223 -1500 2484 -2792 57
          -283 70 -419 70 -748 1 -310 -4 -386 -45 -635 -192 -1169 -955 -2197 -2024
          -2725 -405 -200 -755 -305 -1245 -372 -153 -21 -711 -17 -880 5 -874 119
          -1636 499 -2230 1113 -849 878 -1212 2088 -990 3300 146 797 579 1558 1196
          2103 609 537 1352 856 2169 930 151 14 608 6 755 -13z"></path></g></svg> <p class="font-bold">SKAN Farming Logistics Pty Ltd</p> <p>Copyright © 2024 - ABN: 26 675 693 464</p></div> <div><div class="grid grid-flow-col gap-6"><a href="https://twitter.com/SKANfarming" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition duration-300"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a> <a href="tel:+61439405248" class="fill-current transition duration-300 ease-in-out hover:scale-110 hover:text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="fill-current"><path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"></path><path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z"></path></svg></a> <a href="mailto:ryan@skanfarming.com" class="hover:text-primary transition duration-300"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="fill-current"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z"></path></svg></a></div></div> <div><nav class="footer-center grid grid-flow-col gap-4"><a class="link link-hover" href="/docs/terms_of_service.pdf" target="_blank">Terms of Service</a> <a class="link link-hover" href="/docs/SKAN-Privacy-Policy.pdf" target="_blank">Privacy Policy</a> <a class="link link-hover" href="/">Data Security</a></nav></div></footer></div>`;
});
const isMobile = writable(false);
const createDeviceStore = () => {
  const { subscribe: subscribe2, set } = isMobile;
  const breakpoint = 768;
  const updateInnerWidth = (width) => {
    set(width < breakpoint);
  };
  return {
    subscribe: subscribe2,
    updateInnerWidth
  };
};
const deviceStore = createDeviceStore();
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $deviceStore, $$unsubscribe_deviceStore;
  $$unsubscribe_deviceStore = subscribe(deviceStore, (value) => $deviceStore = value);
  let { data } = $$props;
  let { session } = data;
  let innerWidth = 0;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  {
    deviceStore.updateInnerWidth(innerWidth);
  }
  $$unsubscribe_deviceStore();
  return `  <div class="navbar bg-base-100 container mx-auto">${validate_component(LogoCard, "LogoCard").$$render($$result, { href: "/" }, {}, {})} <div class="flex-none"><ul class="menu menu-horizontal px-1 hidden sm:flex font-bold text-lg"><li class="md:mx-2" data-svelte-h="svelte-ip6c62"><a href="/features">Features</a></li> <li class="md:mx-2" data-svelte-h="svelte-1n9gzzm"><a href="/team">Team</a></li> <li class="md:mx-2" data-svelte-h="svelte-19mvq9q"><a href="/pricing">Pricing</a></li> <li class="md:mx-4">${session ? `<a href="/account" class="border border-primary" data-svelte-h="svelte-1m87wb6">Dashboard</a>` : `<a href="/login/sign_in" class="border border-primary" data-svelte-h="svelte-je94er">★ Enter</a>`}</li></ul> <div class="dropdown dropdown-end sm:hidden">  <label tabindex="0" class="btn btn-ghost btn-circle" data-svelte-h="svelte-btyzg4"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg></label>   <ul tabindex="0" class="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 font-bold"><li data-svelte-h="svelte-nih5my"><a href="/features">Features</a></li> <li data-svelte-h="svelte-13xff5e"><a href="/team">Team</a></li> <li data-svelte-h="svelte-1qtm30u"><a href="/pricing">Pricing</a></li> <li>${session ? `<a href="/account" class="border border-primary" data-svelte-h="svelte-10vzd5p">★ Dashboard</a> <div class="text-sm font-bold mt-1">Welcome, ${escape(session.user.user_metadata.name)}!</div>` : `<a href="/login/sign_in" class="border border-primary" data-svelte-h="svelte-je94er">★ Enter</a>`}</li></ul></div></div></div> ${validate_component(FloatingContact, "FloatingContact").$$render($$result, {}, {}, {})} <div class="">${slots.default ? slots.default({}) : ``}</div>  ${!$deviceStore ? `${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}` : `${validate_component(Footer2, "Footer2").$$render($$result, {}, {}, {})}`}`;
});
export {
  Layout as default
};
