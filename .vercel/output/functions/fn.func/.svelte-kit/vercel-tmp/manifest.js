export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["animations/Animation - 1710405780083.json","animations/Animation - 1710405783862.json","animations/Animation - 1710405950210.json","animations/Animation - 1710406462116.json","animations/Animation - 1710406704037.json","animations/Animation - 1710407141931.json","animations/Animation - 1710407376191.json","animations/CoolLineMap.json","animations/drivingtruckanimation.json","animations/drivingtruckanimation2.json","animations/Error.json","animations/Error2.json","animations/ErrorChill.json","animations/ErrorFun.json","animations/FileBothWays.json","animations/FileOnBlob.json","animations/FileShare.json","animations/FileUploadAnimation.json","animations/IdleFile.json","animations/IdleUpload.json","animations/lineloop.json","animations/lineloopbrown.json","animations/lineloopgreen.json","animations/lineloopgreen2.json","animations/LostNavigation.json","animations/MovingTractor.json","animations/OneFileMovement.json","animations/OneSignalSDKWorker.js","animations/PinDrop.json","animations/PulsingBeacon.json","animations/PulsingBlueBeacon.json","animations/PulsingOrb.json","animations/rollingBalls.json","animations/SpinningGlobe.json","animations/TractorBothWays.json","atlas-icons/packs/achievement/fonts/achievement.eot","atlas-icons/packs/achievement/fonts/achievement.svg","atlas-icons/packs/achievement/fonts/achievement.ttf","atlas-icons/packs/achievement/fonts/achievement.woff","atlas-icons/packs/achievement/style.css","atlas-icons/packs/arrow/fonts/arrow.eot","atlas-icons/packs/arrow/fonts/arrow.svg","atlas-icons/packs/arrow/fonts/arrow.ttf","atlas-icons/packs/arrow/fonts/arrow.woff","atlas-icons/packs/arrow/style.css","atlas-icons/packs/audio/fonts/audio.eot","atlas-icons/packs/audio/fonts/audio.svg","atlas-icons/packs/audio/fonts/audio.ttf","atlas-icons/packs/audio/fonts/audio.woff","atlas-icons/packs/audio/style.css","atlas-icons/packs/basic-ui/fonts/basic-ui.eot","atlas-icons/packs/basic-ui/fonts/basic-ui.svg","atlas-icons/packs/basic-ui/fonts/basic-ui.ttf","atlas-icons/packs/basic-ui/fonts/basic-ui.woff","atlas-icons/packs/basic-ui/style.css","atlas-icons/packs/business-finance/fonts/business-finance.eot","atlas-icons/packs/business-finance/fonts/business-finance.svg","atlas-icons/packs/business-finance/fonts/business-finance.ttf","atlas-icons/packs/business-finance/fonts/business-finance.woff","atlas-icons/packs/business-finance/style.css","atlas-icons/packs/christmas/fonts/christmas.eot","atlas-icons/packs/christmas/fonts/christmas.svg","atlas-icons/packs/christmas/fonts/christmas.ttf","atlas-icons/packs/christmas/fonts/christmas.woff","atlas-icons/packs/christmas/style.css","atlas-icons/packs/cinema/fonts/cinema.eot","atlas-icons/packs/cinema/fonts/cinema.svg","atlas-icons/packs/cinema/fonts/cinema.ttf","atlas-icons/packs/cinema/fonts/cinema.woff","atlas-icons/packs/cinema/style.css","atlas-icons/packs/communication/fonts/communication.eot","atlas-icons/packs/communication/fonts/communication.svg","atlas-icons/packs/communication/fonts/communication.ttf","atlas-icons/packs/communication/fonts/communication.woff","atlas-icons/packs/communication/style.css","atlas-icons/packs/construction/fonts/construction.eot","atlas-icons/packs/construction/fonts/construction.svg","atlas-icons/packs/construction/fonts/construction.ttf","atlas-icons/packs/construction/fonts/construction.woff","atlas-icons/packs/construction/style.css","atlas-icons/packs/content-box/fonts/content-box.eot","atlas-icons/packs/content-box/fonts/content-box.svg","atlas-icons/packs/content-box/fonts/content-box.ttf","atlas-icons/packs/content-box/fonts/content-box.woff","atlas-icons/packs/content-box/style.css","atlas-icons/packs/data-document/fonts/data-document.eot","atlas-icons/packs/data-document/fonts/data-document.svg","atlas-icons/packs/data-document/fonts/data-document.ttf","atlas-icons/packs/data-document/fonts/data-document.woff","atlas-icons/packs/data-document/style.css","atlas-icons/packs/ecology/fonts/ecology.eot","atlas-icons/packs/ecology/fonts/ecology.svg","atlas-icons/packs/ecology/fonts/ecology.ttf","atlas-icons/packs/ecology/fonts/ecology.woff","atlas-icons/packs/ecology/style.css","atlas-icons/packs/electronic-gadget/fonts/electronic-gadget.eot","atlas-icons/packs/electronic-gadget/fonts/electronic-gadget.svg","atlas-icons/packs/electronic-gadget/fonts/electronic-gadget.ttf","atlas-icons/packs/electronic-gadget/fonts/electronic-gadget.woff","atlas-icons/packs/electronic-gadget/style.css","atlas-icons/packs/fitness-gym/fonts/fitness-gym.eot","atlas-icons/packs/fitness-gym/fonts/fitness-gym.svg","atlas-icons/packs/fitness-gym/fonts/fitness-gym.ttf","atlas-icons/packs/fitness-gym/fonts/fitness-gym.woff","atlas-icons/packs/fitness-gym/style.css","atlas-icons/packs/food-beverage/fonts/food-beverage.eot","atlas-icons/packs/food-beverage/fonts/food-beverage.svg","atlas-icons/packs/food-beverage/fonts/food-beverage.ttf","atlas-icons/packs/food-beverage/fonts/food-beverage.woff","atlas-icons/packs/food-beverage/style.css","atlas-icons/packs/furniture/fonts/furniture.eot","atlas-icons/packs/furniture/fonts/furniture.svg","atlas-icons/packs/furniture/fonts/furniture.ttf","atlas-icons/packs/furniture/fonts/furniture.woff","atlas-icons/packs/furniture/style.css","atlas-icons/packs/goals/fonts/goals.eot","atlas-icons/packs/goals/fonts/goals.svg","atlas-icons/packs/goals/fonts/goals.ttf","atlas-icons/packs/goals/fonts/goals.woff","atlas-icons/packs/goals/style.css","atlas-icons/packs/hand-gesture/fonts/hand-gesture.eot","atlas-icons/packs/hand-gesture/fonts/hand-gesture.svg","atlas-icons/packs/hand-gesture/fonts/hand-gesture.ttf","atlas-icons/packs/hand-gesture/fonts/hand-gesture.woff","atlas-icons/packs/hand-gesture/style.css","atlas-icons/packs/hotel-service/fonts/hotel-service.eot","atlas-icons/packs/hotel-service/fonts/hotel-service.svg","atlas-icons/packs/hotel-service/fonts/hotel-service.ttf","atlas-icons/packs/hotel-service/fonts/hotel-service.woff","atlas-icons/packs/hotel-service/style.css","atlas-icons/packs/internet-security/fonts/internet-security.eot","atlas-icons/packs/internet-security/fonts/internet-security.svg","atlas-icons/packs/internet-security/fonts/internet-security.ttf","atlas-icons/packs/internet-security/fonts/internet-security.woff","atlas-icons/packs/internet-security/style.css","atlas-icons/packs/laboratory/fonts/laboratory.eot","atlas-icons/packs/laboratory/fonts/laboratory.svg","atlas-icons/packs/laboratory/fonts/laboratory.ttf","atlas-icons/packs/laboratory/fonts/laboratory.woff","atlas-icons/packs/laboratory/style.css","atlas-icons/packs/leadership/fonts/leadership.eot","atlas-icons/packs/leadership/fonts/leadership.svg","atlas-icons/packs/leadership/fonts/leadership.ttf","atlas-icons/packs/leadership/fonts/leadership.woff","atlas-icons/packs/leadership/style.css","atlas-icons/packs/love/fonts/love.eot","atlas-icons/packs/love/fonts/love.svg","atlas-icons/packs/love/fonts/love.ttf","atlas-icons/packs/love/fonts/love.woff","atlas-icons/packs/love/style.css","atlas-icons/packs/marketing/fonts/marketing.eot","atlas-icons/packs/marketing/fonts/marketing.svg","atlas-icons/packs/marketing/fonts/marketing.ttf","atlas-icons/packs/marketing/fonts/marketing.woff","atlas-icons/packs/marketing/style.css","atlas-icons/packs/medical/fonts/medical.eot","atlas-icons/packs/medical/fonts/medical.svg","atlas-icons/packs/medical/fonts/medical.ttf","atlas-icons/packs/medical/fonts/medical.woff","atlas-icons/packs/medical/style.css","atlas-icons/packs/partnership/fonts/partnership.eot","atlas-icons/packs/partnership/fonts/partnership.svg","atlas-icons/packs/partnership/fonts/partnership.ttf","atlas-icons/packs/partnership/fonts/partnership.woff","atlas-icons/packs/partnership/style.css","atlas-icons/packs/personal-development/fonts/personal-development.eot","atlas-icons/packs/personal-development/fonts/personal-development.svg","atlas-icons/packs/personal-development/fonts/personal-development.ttf","atlas-icons/packs/personal-development/fonts/personal-development.woff","atlas-icons/packs/personal-development/style.css","atlas-icons/packs/real-estate/fonts/real-estate.eot","atlas-icons/packs/real-estate/fonts/real-estate.svg","atlas-icons/packs/real-estate/fonts/real-estate.ttf","atlas-icons/packs/real-estate/fonts/real-estate.woff","atlas-icons/packs/real-estate/style.css","atlas-icons/packs/school/fonts/school.eot","atlas-icons/packs/school/fonts/school.svg","atlas-icons/packs/school/fonts/school.ttf","atlas-icons/packs/school/fonts/school.woff","atlas-icons/packs/school/style.css","atlas-icons/packs/social/fonts/social.eot","atlas-icons/packs/social/fonts/social.svg","atlas-icons/packs/social/fonts/social.ttf","atlas-icons/packs/social/fonts/social.woff","atlas-icons/packs/social/style.css","atlas-icons/packs/sport/fonts/sport.eot","atlas-icons/packs/sport/fonts/sport.svg","atlas-icons/packs/sport/fonts/sport.ttf","atlas-icons/packs/sport/fonts/sport.woff","atlas-icons/packs/sport/style.css","atlas-icons/packs/thanksgiving/fonts/thanksgiving.eot","atlas-icons/packs/thanksgiving/fonts/thanksgiving.svg","atlas-icons/packs/thanksgiving/fonts/thanksgiving.ttf","atlas-icons/packs/thanksgiving/fonts/thanksgiving.woff","atlas-icons/packs/thanksgiving/style.css","atlas-icons/packs/transportation/fonts/transportation.eot","atlas-icons/packs/transportation/fonts/transportation.svg","atlas-icons/packs/transportation/fonts/transportation.ttf","atlas-icons/packs/transportation/fonts/transportation.woff","atlas-icons/packs/transportation/style.css","atlas-icons/packs/travel/fonts/travel.eot","atlas-icons/packs/travel/fonts/travel.svg","atlas-icons/packs/travel/fonts/travel.ttf","atlas-icons/packs/travel/fonts/travel.woff","atlas-icons/packs/travel/style.css","atlas-icons/packs/virtual-reality/fonts/virtual-reality.eot","atlas-icons/packs/virtual-reality/fonts/virtual-reality.svg","atlas-icons/packs/virtual-reality/fonts/virtual-reality.ttf","atlas-icons/packs/virtual-reality/fonts/virtual-reality.woff","atlas-icons/packs/virtual-reality/style.css","atlas-icons/packs/weather/fonts/weather.eot","atlas-icons/packs/weather/fonts/weather.svg","atlas-icons/packs/weather/fonts/weather.ttf","atlas-icons/packs/weather/fonts/weather.woff","atlas-icons/packs/weather/style.css","atlas-icons/packs/web-design/fonts/web-design.eot","atlas-icons/packs/web-design/fonts/web-design.svg","atlas-icons/packs/web-design/fonts/web-design.ttf","atlas-icons/packs/web-design/fonts/web-design.woff","atlas-icons/packs/web-design/style.css","atlas-icons/packs/winter/fonts/winter.eot","atlas-icons/packs/winter/fonts/winter.svg","atlas-icons/packs/winter/fonts/winter.ttf","atlas-icons/packs/winter/fonts/winter.woff","atlas-icons/packs/winter/style.css","atlas-icons/packs/working-together/fonts/working-together.eot","atlas-icons/packs/working-together/fonts/working-together.svg","atlas-icons/packs/working-together/fonts/working-together.ttf","atlas-icons/packs/working-together/fonts/working-together.woff","atlas-icons/packs/working-together/style.css","atlas-icons/packs/world-monuments/fonts/world-monuments.eot","atlas-icons/packs/world-monuments/fonts/world-monuments.svg","atlas-icons/packs/world-monuments/fonts/world-monuments.ttf","atlas-icons/packs/world-monuments/fonts/world-monuments.woff","atlas-icons/packs/world-monuments/style.css","atlas-icons/packs/yoga/fonts/yoga.eot","atlas-icons/packs/yoga/fonts/yoga.svg","atlas-icons/packs/yoga/fonts/yoga.ttf","atlas-icons/packs/yoga/fonts/yoga.woff","atlas-icons/packs/yoga/style.css","atlas-icons/style.css","badge.png","data/BartsSeeding2022.geojson","data/supershedapplication.geojson","data/supershedboundary.geojson","data/supershedboundary.qmd","data/SuperShedHarvest.csv","data/supershedharvest.geojson","data/SuperShedSeeding.csv","data/supershedseeding.geojson","docs/BartsSeeding2022.qmd","docs/Sales-contract.pdf","docs/SKAN-Privacy-Policy.pdf","docs/skan_sample_shapefile.zip","docs/terms_of_service.pdf","docs/vecteezy_farming-icon-pack_7795737.svg","favicon.ico","favicon.png","faviconsquare.png","fonts/archivo-latin-900-normal.woff2","icon.svg","images/Australia_states_and_territories_labelled.png","images/Australia_states_and_territories_labelled.svg","images/ChaserBinUp.png","images/cm_logo.svg","images/example-home.png","images/export-map-location-icon.svg","images/farm-icon.svg","images/farm-land-icon.svg","images/farm-tractor-icon.svg","images/fertilizer-color-icon.svg","images/fertilizer-icon.svg","images/fieldpic_1.jpg","images/fieldpic_2.jpg","images/fieldpic_3.jpg","images/fieldpic_4.jpg","images/fieldpic_5.jpg","images/file-upload-icon.svg","images/folder-upload-icon.svg","images/fuel1.svg","images/fuel2.svg","images/gear.svg","images/gear_2.svg","images/gear_3.svg","images/gear_4.svg","images/grain-wheat-icon.svg","images/HarvestorUp.png","images/image-upload-icon.svg","images/lach-gif.gif","images/lach.png","images/MapLogo.PNG","images/MapLogo2.PNG","images/mobiledisplay1.jpg","images/mobiledisplay2.jpg","images/mobiledisplay3.jpg","images/rss.svg","images/ryan.jpg","images/tractor-color-icon.svg","images/tractor.svg","images/upload-icon.svg","images/upload-round-icon.svg","images/upload-zip-icon.svg","images/x384.png","images/x512.png","manifest.json","robots.txt","userIcons/combine_header_left.svg","userIcons/phone-portrait.svg","userIcons/simple_tractor_up.svg","userIcons/topdown.svg","userIcons/tractor_2_left.svg","userIcons/tractor_left.svg","userIcons/tractor_loader_left.svg","x384.png","x512.png","x512small.png","x512smallsharp.png","service-worker.js"]),
	mimeTypes: {".json":"application/json",".js":"application/javascript",".svg":"image/svg+xml",".ttf":"font/ttf",".woff":"font/woff",".css":"text/css",".png":"image/png",".geojson":"application/geo+json",".csv":"text/csv",".pdf":"application/pdf",".zip":"application/zip",".woff2":"font/woff2",".jpg":"image/jpeg",".gif":"image/gif",".PNG":"image/png",".txt":"text/plain"},
	_: {
		client: {"start":"_app/immutable/entry/start.e73e0ec1.js","app":"_app/immutable/entry/app.3fe24195.js","imports":["_app/immutable/entry/start.e73e0ec1.js","_app/immutable/chunks/scheduler.ccf898a6.js","_app/immutable/chunks/singletons.5b14b65b.js","_app/immutable/chunks/paths.d8f4387a.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/control.c2cf8273.js","_app/immutable/entry/app.3fe24195.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.ccf898a6.js","_app/immutable/chunks/index.7272c3b3.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/7.js')),
			__memo(() => import('../output/server/nodes/8.js')),
			__memo(() => import('../output/server/nodes/9.js')),
			__memo(() => import('../output/server/nodes/10.js')),
			__memo(() => import('../output/server/nodes/11.js')),
			__memo(() => import('../output/server/nodes/12.js')),
			__memo(() => import('../output/server/nodes/13.js')),
			__memo(() => import('../output/server/nodes/14.js')),
			__memo(() => import('../output/server/nodes/15.js')),
			__memo(() => import('../output/server/nodes/16.js')),
			__memo(() => import('../output/server/nodes/17.js')),
			__memo(() => import('../output/server/nodes/18.js')),
			__memo(() => import('../output/server/nodes/19.js')),
			__memo(() => import('../output/server/nodes/20.js')),
			__memo(() => import('../output/server/nodes/21.js')),
			__memo(() => import('../output/server/nodes/22.js')),
			__memo(() => import('../output/server/nodes/23.js')),
			__memo(() => import('../output/server/nodes/24.js')),
			__memo(() => import('../output/server/nodes/26.js')),
			__memo(() => import('../output/server/nodes/30.js')),
			__memo(() => import('../output/server/nodes/31.js')),
			__memo(() => import('../output/server/nodes/32.js')),
			__memo(() => import('../output/server/nodes/33.js')),
			__memo(() => import('../output/server/nodes/34.js')),
			__memo(() => import('../output/server/nodes/36.js'))
		],
		routes: [
			{
				id: "/(admin)/account/(menu)",
				pattern: /^\/account\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/(admin)/account/api",
				pattern: /^\/account\/api\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 17 },
				endpoint: __memo(() => import('../output/server/entries/endpoints/(admin)/account/api/_server.ts.js'))
			},
			{
				id: "/(admin)/account/(menu)/billing",
				pattern: /^\/account\/billing\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/billing/manage",
				pattern: /^\/account\/billing\/manage\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/(admin)/account/create_profile",
				pattern: /^\/account\/create_profile\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/mapviewer",
				pattern: /^\/account\/mapviewer\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/pathplanner",
				pattern: /^\/account\/pathplanner\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/(admin)/account/select_plan",
				pattern: /^\/account\/select_plan\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings",
				pattern: /^\/account\/settings\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/change_email",
				pattern: /^\/account\/settings\/change_email\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/change_password",
				pattern: /^\/account\/settings\/change_password\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/delete_account",
				pattern: /^\/account\/settings\/delete_account\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/edit_profile",
				pattern: /^\/account\/settings\/edit_profile\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/reset_password",
				pattern: /^\/account\/settings\/reset_password\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/(admin)/account/sign_out",
				pattern: /^\/account\/sign_out\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/(admin)/account/subscribe/[slug]",
				pattern: /^\/account\/subscribe\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/(admin)/account/user_survey",
				pattern: /^\/account\/user_survey\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/api/send-notification",
				pattern: /^\/api\/send-notification\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/send-notification/_server.ts.js'))
			},
			{
				id: "/(marketing)/auth/callback",
				pattern: /^\/auth\/callback\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/(marketing)/auth/callback/_server.js'))
			},
			{
				id: "/(marketing)/contact_us",
				pattern: /^\/contact_us\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/(marketing)/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,4,5,], errors: [1,,,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/(marketing)/login/current_password_error",
				pattern: /^\/login\/current_password_error\/?$/,
				params: [],
				page: { layouts: [0,4,5,], errors: [1,,,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/(marketing)/login/forgot_password",
				pattern: /^\/login\/forgot_password\/?$/,
				params: [],
				page: { layouts: [0,4,5,], errors: [1,,,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/(marketing)/login/sign_in",
				pattern: /^\/login\/sign_in\/?$/,
				params: [],
				page: { layouts: [0,4,5,], errors: [1,,,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/(marketing)/login/sign_up",
				pattern: /^\/login\/sign_up\/?$/,
				params: [],
				page: { layouts: [0,4,5,], errors: [1,,,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/(marketing)/team",
				pattern: /^\/team\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 29 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
