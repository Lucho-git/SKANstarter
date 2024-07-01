import { w as writable } from "./index2.js";
import Dexie from "dexie";
const mapboxGl = "";
const MarkerManager_svelte_svelte_type_style_lang = "";
const defaultUserVehicle = {
  id: null,
  coordinates: null,
  last_update: null,
  heading: null,
  is_trailing: false,
  vehicle_marker: {
    type: "tractor",
    color: "white",
    size: "25px"
  }
};
const userVehicleTrailing = writable(defaultUserVehicle.is_trailing);
const db = new Dexie("VehicleTrackerDB");
db.version(1).stores({
  TrailData: "++id, vehicleId, timestamp, coordinates, synced"
});
const MapViewer_svelte_svelte_type_style_lang = "";
export {
  userVehicleTrailing as u
};
