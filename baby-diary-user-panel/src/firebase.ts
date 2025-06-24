// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBQo_G9dMN_QdrV96Jf4FAfn81MyPUe0eY",
  authDomain: "baby-diary-94e16.firebaseapp.com",
  projectId: "baby-diary-94e16",
  storageBucket: "baby-diary-94e16.appspot.com",
  messagingSenderId: "881665735416",
  appId: "1:881665735416:web:bca7d4cc07f8e0710d190d",
  measurementId: "G-F2BCVZRJJR"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);