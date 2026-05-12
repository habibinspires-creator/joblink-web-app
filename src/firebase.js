import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZPhrKDBiF1E0maV-6hY2GrRyqprVxEhQ",
  authDomain: "joblink-habib-844c4.firebaseapp.com",
  projectId: "joblink-habib-844c4",
  storageBucket: "joblink-habib-844c4.firebasestorage.app",
  messagingSenderId: "447965557340",
  appId: "1:447965557340:web:0fd6fdabd675b451a7ec99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

