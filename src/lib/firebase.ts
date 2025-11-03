import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCsVSJS799f-9dKGbDyF6EAMcN-fyw5cBo",
  authDomain: "kamera-takip-18c8d.firebaseapp.com",
  databaseURL: "https://kamera-takip-18c8d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kamera-takip-18c8d",
  storageBucket: "kamera-takip-18c8d.firebasestorage.app",
  messagingSenderId: "955684449041",
  appId: "1:955684449041:web:56cc6002bf68296ddbbab0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
