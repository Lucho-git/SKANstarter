// lib/oneSignal.js
import OneSignal from 'onesignal-node';
import { PUBLIC_ONESIGNAL_APP_ID } from '$env/static/public';

export function initOneSignal() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      window.OneSignal = OneSignal;
      OneSignal.init({
        appId: PUBLIC_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true,
        },
      }).then(() => {
        console.log("OneSignal initialized successfully");
        resolve(OneSignal);
      }).catch(error => {
        console.error("Error initializing OneSignal:", error);
        reject(error);
      });
    } else {
      reject(new Error("Window is not defined"));
    }
  });
}
