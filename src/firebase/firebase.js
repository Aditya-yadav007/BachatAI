import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDbMKRUX8eU0gH6Ck5Tge9bG7AXi1P-aFw",
  authDomain: "reactapp-a51bd.firebaseapp.com",
  projectId: "reactapp-a51bd",
  storageBucket: "reactapp-a51bd.firebasestorage.app",
  messagingSenderId: "436112577872",
  appId: "1:436112577872:web:fedfbb694b08a9ed980855",
  databaseURL: "https://reactapp-a51bd-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
