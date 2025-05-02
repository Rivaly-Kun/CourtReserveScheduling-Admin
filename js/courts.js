import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase config
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
const database = getDatabase(app);
const storage = getStorage(app);

// Add court
// Add court
document.getElementById('addCourtBtn').addEventListener('click', async () => {
    const { value: formValues } = await Swal.fire({
        title: 'Add Court',
        html: `
            <input id="courtName" class="swal2-input" placeholder="Court Name">
            <input id="location" class="swal2-input" placeholder="Location">
            <input id="rate" type="number" min="0" class="swal2-input" placeholder="Rate in ₱ (Pesos)">
            <select id="status" class="swal2-input">
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
                <option value="In Use">In Use</option>
            </select>
            <label>Select 3 Images:</label>
            <input type="file" id="courtImages" class="swal2-file" multiple accept="image/*">
        `,
        focusConfirm: false,
        preConfirm: async () => {
            const name = document.getElementById('courtName').value;
            const location = document.getElementById('location').value;
            const status = document.getElementById('status').value;
            const rate = document.getElementById('rate').value;
            const files = document.getElementById('courtImages').files;

            if (!name || !location || !status || !rate || files.length !== 3) {
                Swal.showValidationMessage("Please fill all fields, set a rate, and upload exactly 3 images.");
                return false;
            }

            const imageURLs = [];
            for (let i = 0; i < 3; i++) {
                const file = files[i];
                const imageRef = sRef(storage, `courts/${Date.now()}_${file.name}`);
                await uploadBytes(imageRef, file);
                const downloadURL = await getDownloadURL(imageRef);
                imageURLs.push(downloadURL);
            }

            return { name, location, status, rate, images: imageURLs };
        }
    });

    if (formValues) {
        const courtRef = push(ref(database, 'courts'));
        await set(courtRef, {
            courtName: formValues.name,
            location: formValues.location,
            status: formValues.status,
            rate: parseFloat(formValues.rate),
            images: formValues.images
        });
        Swal.fire('Success', 'Court added with images and rate!', 'success');
    }
});

// Load courts
function loadCourts() {
    const courtsRef = ref(database, 'courts');
    const tableBody = document.getElementById('AssistantDiv');

    onValue(courtsRef, (snapshot) => {
        tableBody.innerHTML = '';

        snapshot.forEach((childSnapshot) => {
            const court = childSnapshot.val();
            const courtId = childSnapshot.key;

            const row = document.createElement('tr');
            const imageBtn = `
                <button class="view-images-btn" data-images='${JSON.stringify(court.images || [])}'>
                    View Images
                </button>
            `;

            row.innerHTML = `
                <td>${court.courtName}</td>
                <td>${court.location}</td>
                <td>${court.status}</td>
                <td>₱${court.rate ? parseFloat(court.rate).toFixed(2) : '0.00'}</td>
                <td>${imageBtn}</td>
                <td>
                   <button class="edit-btn" data-id="${courtId}" style="cursor:pointer;">
                       ✏️ Edit
                   </button>
                   <button class="delete-btn" data-id="${courtId}" style="background:none;border:none;cursor:pointer;">
                       🗑️ Delete
                   </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // View images handler
        document.querySelectorAll('.view-images-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const images = JSON.parse(e.currentTarget.getAttribute('data-images'));
                const imageHTML = images.map(url => `<img src="${url}" style="max-width:100%; margin:5px; border-radius:10px;">`).join('');

                await Swal.fire({
                    title: 'Court Images',
                    html: `<div style="display:flex; flex-wrap:wrap; justify-content:center;">${imageHTML}</div>`,
                    width: '800px'
                });
            });
        });

        // Edit court
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const courtId = e.currentTarget.getAttribute('data-id');
                const courtRef = ref(database, 'courts/' + courtId);

                onValue(courtRef, async (snapshot) => {
                    const court = snapshot.val();

                    if (court) {
                        const { value: formValues } = await Swal.fire({
                            title: 'Edit Court Details',
                            html: `
                                <input id="courtName" class="swal2-input" value="${court.courtName}" placeholder="Court Name">
                                <input id="location" class="swal2-input" value="${court.location}" placeholder="Location">
                                <input id="rate" type="number" class="swal2-input" value="${court.rate || 50}" placeholder="Rate in ₱">
                                <select id="status" class="swal2-input">
                                    <option value="Available" ${court.status === 'Available' ? 'selected' : ''}>Available</option>
                                    <option value="Maintenance" ${court.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                                    <option value="In Use" ${court.status === 'In Use' ? 'selected' : ''}>In Use</option>
                                </select>
                            `,
                            focusConfirm: false,
                            preConfirm: async () => {
                                const name = document.getElementById('courtName').value;
                                const location = document.getElementById('location').value;
                                const status = document.getElementById('status').value;
                                const rate = document.getElementById('rate').value;

                                if (!name || !location || !status || rate === '') {
                                    Swal.showValidationMessage("Please fill all fields.");
                                    return false;
                                }

                                return { name, location, status, rate };
                            }
                        });

                        if (formValues) {
                            await set(ref(database, 'courts/' + courtId), {
                                courtName: formValues.name,
                                location: formValues.location,
                                status: formValues.status,
                                rate: parseFloat(formValues.rate),
                                images: court.images
                            });

                            Swal.fire('Updated!', 'Court details have been updated.', 'success');
                        }
                    }
                }, { onlyOnce: true });
            });
        });

        // Delete court
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const confirm = await Swal.fire({
                    title: 'Are you sure?',
                    text: "This will permanently delete the court.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!'
                });
                if (confirm.isConfirmed) {
                    await set(ref(database, 'courts/' + id), null);
                    Swal.fire('Deleted!', 'Court has been removed.', 'success');
                }
            });
        });
    });
}

loadCourts();
