import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAGT4ZK8L-bcQzRQ65pVzmsukd9Zx-75uQ",
    authDomain: "courtreservesystem.firebaseapp.com",
    databaseURL: "https://courtreservesystem-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "courtreservesystem",
    storageBucket: "courtreservesystem.firebasestorage.app",
    messagingSenderId: "416725094441",
    appId: "1:416725094441:web:90940d3e42f43549728c38",
    measurementId: "G-3X5LDP2C5N"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

export { app, db };
