// firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBn3GpWBQIJ9WoZ6VGnYx_5jYT73HATPFI",
  authDomain: "neurovault05.firebaseapp.com",
  projectId: "neurovault05",
  storageBucket: "neurovault05.firebasestorage.app",
  messagingSenderId: "54686467973",
  appId: "1:54686467973:web:c8da471c4f40b754e9a6ec",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth + Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
