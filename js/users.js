import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref,onValue, get,update, set, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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


document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded");

  const filterDropdown = document.getElementById('userStatusFilter');
  if (filterDropdown) {
    filterDropdown.value = 'all';
    filterDropdown.addEventListener('change', (e) => {
      const selected = e.target.value;
      loadUsers(selected);
    });
  }

  loadUsers('all'); // ✅ Ensures it runs only after DOM is ready
});


const userDiv = document.getElementById('VerifiedUsers'); // or rename to userTableBody

function loadUsers(filter = 'all') {
  const usersRef = ref(database, 'users');
  userDiv.innerHTML = ''; // Clear initially

  // ✅ Remove "onlyOnce: true" to allow real-time updates
  onValue(usersRef, (snapshot) => {
    userDiv.innerHTML = ''; // Clear on each update
    let foundUsers = false;

    if (snapshot.exists()) {
      const usersData = snapshot.val();

      for (let userId in usersData) {
        const user = usersData[userId];
        const { email, fullName, phone, status } = user;

        // ✅ Apply filter
        if (filter === 'verified') {
          if (!status || status.toLowerCase() !== 'verified') continue;
        } else if (filter === 'unverified') {
          if (status && status.toLowerCase() === 'verified') continue;
        }

        foundUsers = true;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${fullName || 'N/A'}</td>
          <td>${email || 'N/A'}</td>
          <td>${phone || 'N/A'}</td>
          <td>${status || 'unverified'}</td>
          <td>
            <button class="edit-btn" data-id="${userId}" style="cursor:pointer;">Edit</button>
            <button class="delete-btn" data-id="${userId}" style="cursor:pointer;">Delete</button>
          </td>
        `;
        userDiv.appendChild(row);
      }
    }

    // ✅ No matching users
    if (!foundUsers) {
      const row = document.createElement('tr');
      const message = filter === 'verified' ? 'No verified users found' : 'No users found';
      row.innerHTML = `
        <td colspan="5" style="text-align: center; font-style: italic; width: 100%;">${message}</td>
      `;
      userDiv.appendChild(row);
    } else {
      attachEditDeleteListeners(); // ✅ Buttons only after rendering
    }
  });
}


// ✅ Extract Edit/Delete Button Logic
function attachEditDeleteListeners() {
  // Edit Button Logic
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const userId = e.currentTarget.getAttribute('data-id');
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();    
        const { email, fullName, phone } = userData;
        
        const { value: formValues } = await Swal.fire({
          title: 'Edit User',
          html: `
            <input id="editFullName" class="swal2-input" value="${fullName || ''}" placeholder="Full Name">
            <input id="editEmail" class="swal2-input" value="${email || ''}" placeholder="Email">
            <input id="editPhone" class="swal2-input" value="${phone || ''}" placeholder="Phone">
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
            return { fullName, email, phone };
          }
        });
        
        if (formValues) {
          await set(userRef, formValues);
          Swal.fire('Success', 'User details updated!', 'success');
          // ✅ Reload with current filter instead of full page reload
          const currentFilter = document.getElementById('userStatusFilter')?.value || 'all';
          loadUsers(currentFilter);
        }
      }
    });
  });

  // Delete Button Logic
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const userId = e.currentTarget.getAttribute('data-id');
      
      const confirm = await Swal.fire({
        title: 'Delete User?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete!'
      });
      
      if (confirm.isConfirmed) {
        try {
          const userRef = ref(database, `users/${userId}`);
          const verifyRef = ref(database, `verify/${userId}`);
          
          await remove(userRef);
          await remove(verifyRef); // Also remove from verify if exists
          
          e.currentTarget.closest('tr').remove();
          await Swal.fire('Deleted!', 'User has been deleted.', 'success');
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire('Error!', 'Something went wrong during deletion.', 'error');
        }
      }
    });
  });
}

const filterDropdown = document.getElementById('userStatusFilter');
if (filterDropdown) {
  filterDropdown.addEventListener('change', (e) => {
    const selected = e.target.value;
    loadUsers(selected);
  });
}



const verify = ref(database, 'verify');
onValue(verify, (snapshot) => {
    const userDiv = document.getElementById('UnverifiedUsers');
    userDiv.innerHTML = '';
    if (!snapshot.exists()) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; font-style: italic; width: 100%;">No users</td>
        `;
        userDiv.appendChild(row);
        return;
    }
    const usersData = snapshot.val();
    let foundUnverified = false;
    let pending = 0;
    let checked = 0;
    for (let userId in usersData) {
        const user = usersData[userId];
        const { fullName, email, status, idImage } = user;
        if (!status || status.toLowerCase() === 'unverified') {
            pending++;
            const phoneRef = ref(database, `users/${userId}/phone`);
            get(phoneRef).then((phoneSnap) => {
                const phone = phoneSnap.exists() ? phoneSnap.val() : 'N/A';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fullName}</td>
                    <td>${email}</td>
                    <td>${phone}</td>
                    <td>${status || 'Unverified'}</td>
                    <td>
                        <button class="edit-btn" data-id="${userId}" style="cursor:pointer;">Edit</button>
                        <button class="delete-btn" data-id="${userId}" style="cursor:pointer;">Delete</button>
                        <button class="verify-btn" data-id="${userId}" style="cursor:pointer;">Verify</button>
                        <button class="Images-btn" data-id="${userId}" data-image="${idImage}" style="cursor:pointer;">View Images</button>
                    </td>
                `;
                userDiv.appendChild(row);
                foundUnverified = true;
            }).catch((error) => {
                console.error(`Error fetching phone for user ${userId}:`, error);
            }).finally(() => {
                checked++;
                if (checked === pending) {
                    if (!foundUnverified) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td colspan="5" style="text-align: center; font-style: italic; width: 100%;">No users</td>
                        `;
                        userDiv.appendChild(row);
                    }
                    attachEventListeners(); // ✅ Bind buttons only after all DOM rows are appended
                }
            });
        }
    }
    if (pending === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; font-style: italic; width: 100%;">No users</td>
        `;
        userDiv.appendChild(row);
    }
}); // ✅ Properly closed `onValue`

// ✅ Helper to bind events after DOM is updated
function attachEventListeners() {
    // View Image
    document.querySelectorAll('.Images-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const imageUrl = e.currentTarget.getAttribute('data-image');
            if (!imageUrl) {
                return Swal.fire('No Image', 'No image available for this user.', 'info');
            }
            await Swal.fire({
                title: 'User ID Image',
                html: `<div style="display:flex; flex-wrap:wrap; justify-content:center;">
                    <img src="${imageUrl}" style="max-width:100%; margin:5px; border-radius:10px;">
                </div>`,
                width: '800px'
            });
        });
    });       
    
    // Edit Button
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = e.currentTarget.getAttribute('data-id');
            const userRef = ref(database, `users/${userId}`);
            const userSnapshot = await get(userRef);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                const { email, fullName, phone } = userData;
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
                        return { fullName, email, phone };
                    }
                });
                if (formValues) {
                    await set(userRef, formValues);
                    Swal.fire('Success', 'User details updated!', 'success');
                    location.reload();
                }
            }
        });
    });
    
    // Delete Button
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = e.currentTarget.getAttribute('data-id');
            
            const confirm = await Swal.fire({
                title: 'Delete User?',
                text: "This action cannot be undone!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete!'
            });
            
            if (confirm.isConfirmed) {
                try {
                    const userRef = ref(database, `users/${userId}`);
                    const verifyRef = ref(database, `verify/${userId}`);
                    
                    await remove(userRef);
                    await remove(verifyRef); // Also remove from verify if exists
                    
                    e.currentTarget.closest('tr').remove();
                    await Swal.fire('Deleted!', 'User has been deleted.', 'success');
                } catch (error) {
                    console.error("Error deleting user:", error);
                    Swal.fire('Error!', 'Something went wrong during deletion.', 'error');
                }
            }
        });
    });
    
    // Verify Button
    document.querySelectorAll('.verify-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = e.currentTarget.getAttribute('data-id');
            const button = e.currentTarget;
            const confirm = await Swal.fire({
                title: 'Verify User?',
                text: "Do you want to mark this user as verified?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, verify!'
            });
            if (confirm.isConfirmed) {
                try {
                    const userRef = ref(database, `users/${userId}`);
                    const verifyRef = ref(database, `verify/${userId}`);
                    await update(userRef, { status: 'verified' });
                    await remove(verifyRef);
                    button.closest('tr').remove();
                    await Swal.fire('Verified!', 'User has been verified and removed from verify list.', 'success');
                } catch (error) {
                    console.error("Error verifying user:", error);
                    Swal.fire('Error!', 'Something went wrong during verification.', 'error');
                }
            }
        });
    });
}
