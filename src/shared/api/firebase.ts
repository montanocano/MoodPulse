import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  // @ts-ignore — getReactNativePersistence exists at runtime; Firebase 12 types don't export it
  getReactNativePersistence,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  memoryLocalCache,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

// isNewApp = true solo la primera vez en este proceso.
// En hot-reload el módulo se re-evalúa pero Firebase mantiene sus instancias,
// así que solo llamamos initialize* cuando realmente creamos la app.
const isNewApp = getApps().length === 0;
const app = isNewApp ? initializeApp(firebaseConfig) : getApp();

export const auth = isNewApp
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);

// memoryLocalCache: evita que el SDK intente usar IndexedDB (no disponible en RN)
// experimentalAutoDetectLongPolling: detecta automáticamente si usar HTTP o gRPC (recomendado v12+)
export const db = isNewApp
  ? initializeFirestore(app, {
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
    })
  : getFirestore(app);

// REQUIRED Firestore security rule for achievements (read by friends):
// match /users/{uid}/achievements/{aid} {
//   allow read: if request.auth != null;
//   allow write: if request.auth != null && request.auth.uid == uid;
// }
export const storage = getStorage(app);

if (!process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  console.warn(
    "[firebase] EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET is not set — profile photo uploads will fail.",
  );
}

export default app;
