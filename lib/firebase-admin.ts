import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

export const adminConfigured = Boolean(projectId && clientEmail && privateKey);
const app = adminConfigured
  ? (getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      ...(storageBucket ? { storageBucket } : {}),
    }))
  : null;

export const adminAuth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app && storageBucket ? getStorage(app) : null;
