import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyABdijp7h0rm7hObXABdulPf5BJFRzbQBA",
  authDomain: "recovery-routine-planner.firebaseapp.com",
  projectId: "recovery-routine-planner",
  storageBucket: "recovery-routine-planner.firebasestorage.app",
  messagingSenderId: "201681872505",
  appId: "1:201681872505:web:f207787814ad94dafb56a8",
  measurementId: "G-R8C2FXH6J6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Safe Analytics initialization
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Analytics not supported or blocked in this environment:", err);
});
