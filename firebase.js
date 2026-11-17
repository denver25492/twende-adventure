
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA0Zk0JYARBODqT12BOqF8fF5l0fBW5L6I",
    authDomain: "twende-adventure.firebaseapp.com",
    projectId: "twende-adventure",
    storageBucket: "twende-adventure.firebasestorage.app",
    messagingSenderId: "724662968101",
    appId: "1:724662968101:web:cf40b9b434b368568784cc",
    measurementId: "G-9DW4LYZXTM"
};

const app = initializeApp(firebaseConfig);

// Connect Firebase Authentication
export const auth = getAuth(app);

// Connect to your Firestore database named kenya
export const db = getFirestore(app, "kenya");
