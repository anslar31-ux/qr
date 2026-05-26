import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCynywKGiiPnY8VrnmkSfmfRP_ybmrUkAg",
  authDomain: "qr-cafe-1.firebaseapp.com",
  projectId: "qr-cafe-1",
  storageBucket: "qr-cafe-1.firebasestorage.app",
  messagingSenderId: "242500302048",
  appId: "1:242500302048:web:68c200351d9e441cc74c85",
  measurementId: "G-CYWH8WGR82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
