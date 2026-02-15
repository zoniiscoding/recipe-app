import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBC2p6Dd763kvQAzcgnpMNwXTDaAyNaAf4",
  authDomain: "recipe-app-904ac.firebaseapp.com",
  projectId: "recipe-app-904ac",
  storageBucket: "recipe-app-904ac.firebasestorage.app",
  messagingSenderId: "763198356056",
  appId: "1:763198356056:web:61a5f2a864bc991454682d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

  

