// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAVg-yIij95JUbkocmcT93PBPxGxXvs-X8",
  authDomain: "majestic-shoe-palace.firebaseapp.com",
  projectId: "majestic-shoe-palace",
  storageBucket: "majestic-shoe-palace.appspot.com",
  messagingSenderId: "1869888124",
  appId: "1:1869888124:web:3b85ea4680ab699f9c67f9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- add this named export

export default app;
