// src/routes/admin/mapviewer/[type=field|vehicle|marker]/[id]/+page.ts
import type { PageLoad } from './$types';
import { mapFieldsStore } from '$lib/stores/mapFieldsStore';
import { selectedOperationStore } from '$lib/stores/operationStore';
import {
    controlStore,
    showEndTrailModal,
    trailingButtonPressed,
    crispVisibility,
    drawingModeEnabled
} from '../../../../../stores/controlStore';
import {
    currentTrailStore,
    coordinateBufferStore,
    unsavedCoordinatesStore,
    unsavedTrailsStore
} from '$lib/stores/currentTrailStore';
import {
    historicalTrailStore,
    otherActiveTrailStore
} from '$lib/stores/otherTrailStore';

// Define default values
const defaultStoreValues = {
    controls: {
        showMarkerMenu: false,
        showVehicleMenu: false,
    },
    showEndTrailModal: false,
    trailingButtonPressed: false,
    crispVisibility: false,
    drawingModeEnabled: false,
    currentTrail: null,
    coordinateBuffer: [],
    unsavedCoordinates: [],
    unsavedTrails: [],
    historicalTrails: [],
    otherActiveTrails: []
};

function initializeStores() {
    // Initialize all control-related stores with default values
    controlStore.set(defaultStoreValues.controls);
    showEndTrailModal.set(defaultStoreValues.showEndTrailModal);
    trailingButtonPressed.set(defaultStoreValues.trailingButtonPressed);
    crispVisibility.set(defaultStoreValues.crispVisibility);
    drawingModeEnabled.set(defaultStoreValues.drawingModeEnabled);

    // Initialize trail-related stores
    currentTrailStore.set(defaultStoreValues.currentTrail);
    coordinateBufferStore.set(defaultStoreValues.coordinateBuffer);
    unsavedCoordinatesStore.set(defaultStoreValues.unsavedCoordinates);
    unsavedTrailsStore.set(defaultStoreValues.unsavedTrails);

    // Initialize historical and other active trail stores
    historicalTrailStore.set(defaultStoreValues.historicalTrails);
    otherActiveTrailStore.set(defaultStoreValues.otherActiveTrails);
}

export const load: PageLoad = async ({ data, url, fetch }) => {
    // Initialize stores with default values first
    initializeStores();

    // Then override with actual data if available
    if (data.fields) {
        mapFieldsStore.set(data.fields);
    }

    let objectType: string | null = null;
    let objectId: string | null = null;
    let objectLocation = null;

    // Check for any of the possible object types in the query parameters
    ['field', 'vehicle', 'marker'].forEach(type => {
        const id = url.searchParams.get(type);
        if (id) {
            objectType = type;
            objectId = id;
        }
    });

    if (objectType && objectId) {
        try {
            const response = await fetch(`/api/location?type=${objectType}&id=${objectId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const locationData = await response.json();
            console.log('Response', locationData);
            objectLocation = locationData.location;
            console.log(`Fetched ${objectType} location:`, objectLocation);
        } catch (error) {
            console.error(`Error fetching ${objectType} location:`, error);
        }
    }

    return {
        fields: data.fields,
        type: objectType,
        id: objectId,
        location: objectLocation
    };
};