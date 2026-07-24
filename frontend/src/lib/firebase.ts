// ──────────────────────────────────────────────────────────────────────────────
// Firebase Configuration — Think10
// ──────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvT4kRWguHuksRJUk1zQ3oWInOL9P3Lms",
  authDomain: "think10-8eb22.firebaseapp.com",
  projectId: "think10-8eb22",
  storageBucket: "think10-8eb22.firebasestorage.app",
  messagingSenderId: "189978156376",
  appId: "1:189978156376:web:b7be53344e25aad814592d",
  measurementId: "G-DDLF6RPP4B",
};

// Prevent re-initialising on HMR reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
