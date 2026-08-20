"use client";

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyC2cD8s816pK1xC_zSI4eGG_Yjro8X_Gm4",
  authDomain: "mobiking-25fc3.firebaseapp.com",
  projectId: "mobiking-25fc3",
  storageBucket: "mobiking-25fc3.firebasestorage.app",
  messagingSenderId: "397433355252",
  appId: "1:397433355252:web:cc8c08179b3ad2c10857a1",
  measurementId: "G-3VDBG6F3R8"
};

const app = initializeApp(firebaseConfig);

export async function getMessagingInstance() {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(app);
}

export async function ensureServiceWorkerRegistered() {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  if (!registration) {
    registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  }
  return registration;
}

export async function requestPermissionAndSubscribe(userId = null) {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("Notification permission not granted:", permission);
    return null;
  }

  const registration = await ensureServiceWorkerRegistered();
  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.log("Firebase messaging not supported in this browser.");
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error("VAPID key missing: set NEXT_PUBLIC_FIREBASE_VAPID_KEY");
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Token obtained:", token);

      // Call backend route to subscribe to "b2bUsers" topic
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      await axios.post(`${backendUrl}/notifications/subscribe`, {
        token,
        topic: "b2bUsers"
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      });

      console.log("Subscribed token to b2bUsers topic on backend.");
      return token;
    } else {
      console.log("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("Error getting/subscribing token:", err);
    return null;
  }
}

export async function onMessageListener() {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}
