import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAr1qfwkq3YIAAcJLjhonY_zuLZ7gstA7E",
  authDomain: "mindscape-f129e.firebaseapp.com",
  projectId: "mindscape-f129e",
  storageBucket: "mindscape-f129e.firebasestorage.app",
  messagingSenderId: "1012071602966",
  appId: "1:1012071602966:web:288f2a66f9a697f6c28e37",
  measurementId: "G-Q1BN46YQ8S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);