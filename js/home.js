import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGT4ZK8L-bcQzRQ65pVzmsukd9Zx-75uQ",
  authDomain: "courtreservesystem.firebaseapp.com",
  projectId: "courtreservesystem",
  storageBucket: "courtreservesystem.firebasestorage.app",
  messagingSenderId: "416725094441",
  appId: "1:416725094441:web:90940d3e42f43549728c38",
  measurementId: "G-3X5LDP2C5N",
  databaseURL: "https://courtreservesystem-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const reservationsRef = ref(db, "reservations");
const productsDiv = document.getElementById("productsDiv");
const courtsRef = ref(db, 'courts');


// Fetch and update court availability counts
onValue(courtsRef, (snapshot) => {
    let availableCount = 0;
    let unavailableCount = 0;

    snapshot.forEach((childSnapshot) => {
        const court = childSnapshot.val();
        if (court.status === "Available") {
            availableCount++;
        } else {
            unavailableCount++;
        }
    });

    document.getElementById("Reports").innerText = availableCount;
    document.getElementById("Total_Users").innerText = unavailableCount;
});

// Fetch and count pending reservation requests
onValue(reservationsRef, (snapshot) => {
    let pendingCount = 0;

    snapshot.forEach((childSnapshot) => {
        const reservation = childSnapshot.val();
        if (!reservation.status) {
            pendingCount++;
        }
    });

    document.getElementById("Requests").innerText = pendingCount;
});



onValue(reservationsRef, (snapshot) => {
  const reservations = snapshot.val();
  productsDiv.innerHTML = ""; 

  if (!reservations) return;

  Object.entries(reservations).forEach(([resId, res]) => {
    if (!res.status || res.status.toLowerCase() !== "accepted") {
      const userRef = ref(db, `users/${res.userId}`);
      onValue(userRef, (userSnap) => {
        const user = userSnap.val();
        const username = user?.fullName || "Unknown";
        const email = user?.email || "Unknown";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${username}</td>
          <td>${email}</td>
          <td>${res.status || "Pending"}</td>
          <td><button data-id="${resId}" class="view-images-btn">View</button></td>
        `;
        productsDiv.appendChild(tr);
      }, { onlyOnce: true });
    }
  });

  productsDiv.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('view-images-btn')) {
      const resId = e.target.getAttribute('data-id');
  
      showContent('post-content', 'Booking');
      document.getElementById('BreadcrumName').textContent = 'Booking'; 
  
      // >>> Toggle active class on #post-link's parent <li> <<<
      const allSideMenuItems = document.querySelectorAll('#sidebar .side-menu.top li');
      allSideMenuItems.forEach(li => li.classList.remove('active'));
  
      const postLink = document.getElementById('post-link');
      if (postLink) {
        const li = postLink.closest('li');
        if (li) li.classList.add('active');
      }
    }
  });
  
  

  function showContent(contentId, title) {
    contentTitle.textContent = title;

    const contentSections = [
      'dashboard-content',
      'all-members-content',
      'analytics-content',
      'post-content',
      'asstitant-content'
    ];

    contentSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    const targetContent = document.getElementById(contentId);
    if (targetContent) targetContent.style.display = 'block';
  }
});


const announcementsDiv = document.getElementById("AnnouncementsDiv");

onValue(reservationsRef, (snapshot) => {
  const reservations = snapshot.val();
  announcementsDiv.innerHTML = "";

  if (!reservations) return;

  const userIdsShown = new Set();

  Object.entries(reservations).forEach(([resId, res]) => {
    if (res.status && res.status.toLowerCase() === "accepted" && !userIdsShown.has(res.userId)) {
      userIdsShown.add(res.userId);

      const userRef = ref(db, `users/${res.userId}`);
      onValue(userRef, (userSnap) => {
        const user = userSnap.val();
        const username = user?.fullName || "Unknown";
        const email = user?.email || "Unknown";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${username}</td>
          <td>${email}</td>
        `;
        announcementsDiv.appendChild(tr);
      }, { onlyOnce: true });
    }
  });
});
