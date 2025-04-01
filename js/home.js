// Import Firebase from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGT4ZK8L-bcQzRQ65pVzmsukd9Zx-75uQ",
  authDomain: "courtreservesystem.firebaseapp.com",
  projectId: "courtreservesystem",
  storageBucket: "courtreservesystem.firebasestorage.app",
  messagingSenderId: "416725094441",
  appId: "1:416725094441:web:90940d3e42f43549728c38",
  measurementId: "G-3X5LDP2C5N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

