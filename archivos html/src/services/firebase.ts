import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const getEnv = (key: string, fallback: string = ''): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {}
  return fallback;
};

const apiKey = getEnv('VITE_FIREBASE_API_KEY', '');
const projectId = getEnv('VITE_FIREBASE_PROJECT_ID', '');

// Only treat Firebase as configured if real credentials (not remixed placeholders) are present
export const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  projectId !== 'esquela-digital-ar' &&
  projectId !== 'remixed-project-id' &&
  !apiKey.startsWith('AIzaSyCRojlNPzlyxDLPrfM44fDzYrr')
);

export const firebaseConfig = {
  apiKey: apiKey || '',
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', projectId ? `${projectId}.firebaseapp.com` : ''),
  projectId: projectId || '',
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', projectId ? `${projectId}.firebasestorage.app` : ''),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', ''),
  appId: getEnv('VITE_FIREBASE_APP_ID', ''),
};

let appInstance = null;
let firestoreInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreInstance = getFirestore(appInstance);
  } catch (err) {
    console.warn('Advertencia al inicializar Firebase Firestore:', err);
  }
}

export const app = appInstance;
export const db = firestoreInstance;
