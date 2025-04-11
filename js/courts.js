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
document.getElementById('addCourtBtn').addEventListener('click', async () => {
    const { value: formValues } = await Swal.fire({
        title: 'Add Court',
        html: `
            <input id="courtName" class="swal2-input" placeholder="Court Name">
            <input id="location" class="swal2-input" placeholder="Location">
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
            const files = document.getElementById('courtImages').files;

            if (!name || !location || !status || files.length !== 3) {
                Swal.showValidationMessage("Please fill all fields and upload exactly 3 images.");
                return false;
            }

            // Upload images
            const imageURLs = [];
            for (let i = 0; i < 3; i++) {
                const file = files[i];
                const imageRef = sRef(storage, `courts/${Date.now()}_${file.name}`);
                await uploadBytes(imageRef, file);
                const downloadURL = await getDownloadURL(imageRef);
                imageURLs.push(downloadURL);
            }

            return { name, location, status, images: imageURLs };
        }
    });

    if (formValues) {
        const courtRef = push(ref(database, 'courts'));
        await set(courtRef, {
            courtName: formValues.name,
            location: formValues.location,
            status: formValues.status,
            images: formValues.images
        });
        Swal.fire('Success', 'Court added with images!', 'success');
    }
});

// Load courts
// Load courts
function loadCourts() {
    const courtsRef = ref(database, 'courts');
    const tableBody = document.getElementById('AssistantDiv');

    onValue(courtsRef, (snapshot) => {
        tableBody.innerHTML = ''; // Clear current rows

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
                <td>${imageBtn}</td>
                <td>

                   <button class="edit-btn" data-id="${courtId}" style="cursor:pointer;">
                   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M20.849 8.713a3.932 3.932 0 0 0-5.562-5.561l-.887.887l.038.111a8.75 8.75 0 0 0 2.093 3.32a8.75 8.75 0 0 0 3.43 2.13z" opacity="0.5"/>\
                   <path fill="currentColor" d="m14.439 4l-.039.038l.038.112a8.75 8.75 0 0 0 2.093 3.32a8.75 8.75 0 0 0 3.43 2.13l-8.56 8.56c-.578.577-.867.866-1.185 1.114a6.6 6.6 0 0 1-1.211.748c-.364.174-.751.303-1.526.561l-4.083 1.361a1.06 1.06 0 0 1-1.342-1.341l1.362-4.084c.258-.774.387-1.161.56-1.525q.309-.646.749-1.212c.248-.318.537-.606 1.114-1.183z"/>
                   </svg>

                     Edit</button>
<button class="delete-btn" data-id="${courtId}" style="background:none;border:none;cursor:pointer;">
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M9.25 3a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v.75H19a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1 0-1.5h4.25z"/><path fill="currentColor" fill-rule="evenodd" d="M6.24 7.945a.5.5 0 0 1 .497-.445h10.526a.5.5 0 0 1 .497.445l.2 1.801a44.2 44.2 0 0 1 0 9.771l-.02.177a2.6 2.6 0 0 1-2.226 2.29a26.8 26.8 0 0 1-7.428 0a2.6 2.6 0 0 1-2.227-2.29l-.02-.177a44.2 44.2 0 0 1 0-9.77zm4.51 3.455a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0zm4 0a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0z" clip-rule="evenodd"/>
</svg> Delete</button>

                </td>
            `;
            tableBody.appendChild(row);
        });

        // 🔥 Add event listener for View Images button
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

// Edit court functionality
document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const courtId = e.currentTarget.getAttribute('data-id');

        // Fetch the current court details from the database
        const courtRef = ref(database, 'courts/' + courtId);
        onValue(courtRef, async (snapshot) => {
            const court = snapshot.val();

            if (court) {
                // Open Swal modal with pre-filled data
                const { value: formValues } = await Swal.fire({
                    title: 'Edit Court Details',
                    html: `
                        <input id="courtName" class="swal2-input" value="${court.courtName}" placeholder="Court Name">
                        <input id="location" class="swal2-input" value="${court.location}" placeholder="Location">
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

                        if (!name || !location || !status) {
                            Swal.showValidationMessage("Please fill all fields.");
                            return false;
                        }

                        return { name, location, status };
                    }
                });

                if (formValues) {
                    // Update court details in the database
                    await set(ref(database, 'courts/' + courtId), {
                        courtName: formValues.name,
                        location: formValues.location,
                        status: formValues.status,
                        images: court.images // Keep the images as they are
                    });

                    Swal.fire('Updated!', 'Court details have been updated.', 'success');
                }
            }
        });
    });
});


        // 🗑️ Delete court
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

        // ✏️ Edit court functionality (add event listener)
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const courtId = e.currentTarget.getAttribute('data-id');
                // Handle edit functionality here, e.g., show a Swal modal with existing data
                console.log('Edit court with ID:', courtId);
                // You can create a modal for editing the court's details
            });
        });
    });
}

loadCourts();
