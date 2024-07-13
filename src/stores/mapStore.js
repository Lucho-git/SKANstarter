// @src\stores\mapStore.js

//@ts-nocheck
import { writable } from 'svelte/store';

export const mapStore = writable(null);


export const selectedMarkerStore = writable(null);

function createConfirmedMarkersStore() {
    const { subscribe, set, update } = writable([]);
  
    let subscriberCount = 0;
  
    function customSubscribe(run, invalidate) {
      subscriberCount++;
    //   console.log(`Got a subscriber to confirmedMarkersStore. Total subscribers: ${subscriberCount}`);
  
      const unsubscribe = subscribe(run, invalidate);
  
      return () => {
        subscriberCount--;
        // console.log(`Subscriber to confirmedMarkersStore unsubscribed. Total subscribers: ${subscriberCount}`);
        unsubscribe();
      };
    }
  
    return {
      subscribe: customSubscribe,
      set,
      update,
    };
  }
  
  export const confirmedMarkersStore = createConfirmedMarkersStore();

function createRemoveMarkerStore() {
  let subscriberCount = 0;

  const { subscribe, set, update } = writable([], () => {
    subscriberCount++;
    // console.log(`Got a subscriber to removeMarkerStore. Total subscribers: ${subscriberCount}`);
    
    return () => {
      subscriberCount--;
    //   console.log(`Subscriber to removeMarkerStore unsubscribed. Total subscribers: ${subscriberCount}`);
    };
  });

  return {
    subscribe,
    set,
    update,
  };
}

export const removeMarkerStore = createRemoveMarkerStore();

function createMarkerActionsStore() {
  let subscriberCount = 0;

  const { subscribe, set, update } = writable([], () => {
    subscriberCount++;
    // console.log(`Got a subscriber to markerActionsStore. Total subscribers: ${subscriberCount}`);
    
    return () => {
      subscriberCount--;
    //   console.log(`Subscriber to markerActionsStore unsubscribed. Total subscribers: ${subscriberCount}`);
    };
  });

  return {
    subscribe,
    set,
    update,
  };
}

export const markerActionsStore = createMarkerActionsStore();

export const syncStore = writable({
    synchronizeMarkers: null,
    spinning: false
  });