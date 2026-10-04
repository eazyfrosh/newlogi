import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

type ServiceAccountEnv = {
  project_id?: string;
  projectId?: string;
  client_email?: string;
  clientEmail?: string;
  private_key?: string;
  privateKey?: string;
};

const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY?.trim();
const serviceAccountJson =
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
  (privateKeyEnv?.startsWith("{") ? privateKeyEnv : undefined);
let serviceAccount: ServiceAccountEnv | null = null;
if (serviceAccountJson) {
  try {
    serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccountEnv;
  } catch (error) {
    console.error(
      "[firebase-admin] Service-account JSON is invalid:",
      error instanceof Error ? error.message : error,
    );
  }
}

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  serviceAccount?.project_id ||
  serviceAccount?.projectId ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail =
  process.env.FIREBASE_CLIENT_EMAIL ||
  serviceAccount?.client_email ||
  serviceAccount?.clientEmail;
const privateKeySource = privateKeyEnv?.startsWith("{")
  ? serviceAccount?.private_key || serviceAccount?.privateKey
  : privateKeyEnv || serviceAccount?.private_key || serviceAccount?.privateKey;
const privateKey = privateKeySource?.replace(/\\n/g, "\n");
const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const hasAdminCredentials = Boolean(projectId && clientEmail && privateKey);
let app: ReturnType<typeof initializeApp> | null = null;
if (hasAdminCredentials) {
  try {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        ...(storageBucket ? { storageBucket } : {}),
      });
  } catch (error) {
    console.error(
      "[firebase-admin] Initialization failed:",
      error instanceof Error
        ? { name: error.name, message: error.message }
        : error,
    );
  }
}

export const adminConfigured = Boolean(app);
export const adminAuth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app && storageBucket ? getStorage(app) : null;
