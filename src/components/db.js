// db.js
import Dexie from 'dexie';

export const db = new Dexie('VehicleTrackerDB');

db.version(1).stores({
    TrailData: '++id, vehicleId, timestamp, coordinates, synced',
  });