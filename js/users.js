import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

// Reference to all users in the database
const usersRef = ref(database, 'users');

// Fetch all users and display them
get(usersRef).then((snapshot) => {
    if (snapshot.exists()) {
        const usersData = snapshot.val();
        const userDiv = document.getElementById('UserDiv');
        userDiv.innerHTML = '';  // Clear existing content

        // Loop through each user and display their data
        for (let userId in usersData) {
            const user = usersData[userId];
            const { email, fullName, phone } = user;

            // Create a new table row for each user
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fullName}</td>
                <td>${email}</td>
                <td>${phone}</td>
                <td>
                    <button class="edit-btn" data-id="${userId}" style="cursor:pointer;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M20.849 8.713a3.932 3.932 0 0 0-5.562-5.561l-.887.887l.038.111a8.75 8.75 0 0 0 2.093 3.32a8.75 8.75 0 0 0 3.43 2.13z" opacity="0.5"/><path fill="currentColor" d="m14.439 4l-.039.038l.038.112a8.75 8.75 0 0 0 2.093 3.32a8.75 8.75 0 0 0 3.43 2.13l-8.56 8.56c-.578.577-.867.866-1.185 1.114a6.6 6.6 0 0 1-1.211.748c-.364.174-.751.303-1.526.561l-4.083 1.361a1.06 1.06 0 0 1-1.342-1.341l1.362-4.084c.258-.774.387-1.161.56-1.525q.309-.646.749-1.212c.248-.318.537-.606 1.114-1.183z"/></svg>
                     Edit</button>
                    <button class="delete-btn" data-id="${userId}" style="cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M9.25 3a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v.75H19a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1 0-1.5h4.25z"/><path fill="currentColor" fill-rule="evenodd" d="M6.24 7.945a.5.5 0 0 1 .497-.445h10.526a.5.5 0 0 1 .497.445l.2 1.801a44.2 44.2 0 0 1 0 9.771l-.02.177a2.6 2.6 0 0 1-2.226 2.29a26.8 26.8 0 0 1-7.428 0a2.6 2.6 0 0 1-2.227-2.29l-.02-.177a44.2 44.2 0 0 1 0-9.77zm4.51 3.455a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0zm4 0a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0z" clip-rule="evenodd"/></svg> Delete</button>
                </td>
            `;
            userDiv.appendChild(row);
        }

        // Add event listeners for Edit and Delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                const userRef = ref(database, `users/${userId}`);
                const userSnapshot = await get(userRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();
                    const { email, fullName, phone } = userData;

                    // Open a SweetAlert to edit user data
                    const { value: formValues } = await Swal.fire({
                        title: 'Edit User',
                        html: `
                            <input id="editFullName" class="swal2-input" value="${fullName}" placeholder="Full Name">
                            <input id="editEmail" class="swal2-input" value="${email}" placeholder="Email">
                            <input id="editPhone" class="swal2-input" value="${phone}" placeholder="Phone">
                        `,
                        focusConfirm: false,
                        preConfirm: () => {
                            const fullName = document.getElementById('editFullName').value;
                            const email = document.getElementById('editEmail').value;
                            const phone = document.getElementById('editPhone').value;

                            if (!fullName || !email || !phone) {
                                Swal.showValidationMessage("Please fill in all fields.");
                                return false;
                            }

                            // Update the user's data in Firebase
                            set(userRef, { fullName, email, phone });
                        }
                    });

                    if (formValues) {
                        Swal.fire('Success', 'User details updated!', 'success');
                        // Reload user data after edit
                        location.reload();
                    }
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                const confirm = await Swal.fire({
                    title: 'Are you sure?',
                    text: "This will permanently delete the user.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!'
                });

                if (confirm.isConfirmed) {
                    // Delete the user from Firebase
                    await remove(ref(database, `users/${userId}`));
                    Swal.fire('Deleted!', 'User has been removed.', 'success');
                    // Reload user data after delete
                    location.reload();
                }
            });
        });
    } else {
        console.log("No user data found");
    }
}).catch((error) => {
    console.error("Error fetching users data: ", error);
});
