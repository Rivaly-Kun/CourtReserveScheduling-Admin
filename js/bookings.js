// admin-bookings.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, get, child, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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
const postDiv = document.getElementById("PostDiv");

const reservationsRef = ref(db, "reservations");
const usersRef = ref(db, "users");

onValue(reservationsRef, async (snapshot) => {
    postDiv.innerHTML = ""; // Clear existing rows

    const reservations = [];
    snapshot.forEach((childSnapshot) => {
        const resData = childSnapshot.val();
        const resId = childSnapshot.key;
        reservations.push({ ...resData, reservationId: resId });
    });

    for (const res of reservations) {
        const userId = res.userId;
        let fullName = "Unknown";
        let email = "N/A";
        let phone = "N/A";

        try {
            const userSnapshot = await get(child(usersRef, userId));
            if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                fullName = userData.fullName || "Unknown";
                email = userData.email || "N/A";
                phone = userData.phone || "N/A";
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }

        const tr = document.createElement("tr");
        
        let actionButtons = `
        <button class="accept" onclick="acceptReservation('${res.reservationId}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48">
                <g fill="none" stroke-linejoin="round" stroke-width="4">
                    <path fill="#2f88ff" stroke="#000" d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z"/>
                    <path stroke="#fff" stroke-linecap="round" d="M16 24L22 30L34 18"/>
                </g>
            </svg> Accept
        </button>
        <button class="reject" onclick="rejectReservation('${res.reservationId}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48"><g fill="none" stroke-linejoin="round" stroke-width="4"><path fill="#ff2f2f" stroke="#000" d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"/><path stroke="#fff" stroke-linecap="round" d="M29.6567 18.3432L18.343 29.6569"/><path stroke="#fff" stroke-linecap="round" d="M18.3433 18.3432L29.657 29.6569"/></g></svg> Reject
        </button>
    `;
    
    if (res.status === "accepted") {
        actionButtons = `
            <button class="cancel" onclick="cancelReservation('${res.reservationId}')">
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48"><g fill="none" stroke-linejoin="round" stroke-width="4"><path fill="#ff2f2f" stroke="#000" d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"/><path stroke="#fff" stroke-linecap="round" d="M29.6567 18.3432L18.343 29.6569"/><path stroke="#fff" stroke-linecap="round" d="M18.3433 18.3432L29.657 29.6569"/></g></svg> Cancel
            </button>
        `;
    }
    

        tr.innerHTML = `
            <td>${fullName}</td>
            <td>${email}</td>
            <td>${phone}</td>
            <td>${res.courtName || "Unknown Court"}</td>
            <td>${res.startTimeReadable || "N/A"}</td>
            <td>${res.endTimeReadable || "N/A"}</td>
            <td>${actionButtons}</td>
        `;

        postDiv.appendChild(tr);
    }
});

// Global function to accept the reservation
window.acceptReservation = function (reservationId) {
    const reservationRef = ref(db, 'reservations/' + reservationId);

    // Update reservation status to accepted
    update(reservationRef, {
        status: "accepted"
    }).then(() => {
        alert(`Reservation ${reservationId} accepted!`);
        // Refresh the data to update the buttons
        location.reload();
    }).catch((error) => {
        console.error("Error accepting reservation:", error);
    });
}

// Global function to reject the reservation
window.rejectReservation = function (reservationId) {
    const reservationRef = ref(db, 'reservations/' + reservationId);

    // Update reservation status to rejected
    update(reservationRef, {
        status: "rejected"
    }).then(() => {
        alert(`Reservation ${reservationId} rejected!`);
        // Refresh the data to update the buttons
        location.reload();
    }).catch((error) => {
        console.error("Error rejecting reservation:", error);
    });
}

// Global function to cancel the reservation
window.cancelReservation = function (reservationId) {
    const reservationRef = ref(db, 'reservations/' + reservationId);

    // Update reservation status to canceled
    update(reservationRef, {
        status: "canceled"
    }).then(() => {
        alert(`Reservation ${reservationId} canceled!`);
        // Refresh the data to remove the Cancel button
        location.reload();
    }).catch((error) => {
        console.error("Error canceling reservation:", error);
    });
}
