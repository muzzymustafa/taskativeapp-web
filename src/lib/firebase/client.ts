import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCg2gMgHW5wBFdPEZegMhOjRLhWaLXGAyk",
  authDomain: "energy-a2aad.firebaseapp.com",
  projectId: "energy-a2aad",
  storageBucket: "energy-a2aad.firebasestorage.app",
  messagingSenderId: "204034228816",
  appId: "1:204034228816:web:taskative",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const clientAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
