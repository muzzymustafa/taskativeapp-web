import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5U0sq27tVGbyV9UPP58V7QZeddALVSkI",
  authDomain: "energy-a2aad.firebaseapp.com",
  projectId: "energy-a2aad",
  storageBucket: "energy-a2aad.firebasestorage.app",
  messagingSenderId: "204034228816",
  appId: "1:204034228816:web:59ec8eaccd03cfc51d8755",
  measurementId: "G-1LTPHV91H3",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const clientAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
