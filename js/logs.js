// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, remove, update, set,get  } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function loadHistory() {
    const historyRef = ref(database, 'history');
    const historyTbody = document.getElementById('HistoryDiv');

    onValue(historyRef, (snapshot) => {
        historyTbody.innerHTML = '';

        if (!snapshot.exists()) {
            historyTbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; font-style:italic;">
                        No history found
                    </td>
                </tr>
            `;
            return;
        }

        const historyData = snapshot.val();

        for (let historyId in historyData) {
            const history = historyData[historyId];
            const { courtName, startTimeReadable, endTimeReadable, payment, userId } = history;

            const username = ref(database, "/users/" + userId + "/fullName/");
            get(username).then((snapshot) => {
                const fullName = snapshot.val();

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fullName || 'Unknown'}</td>
                    <td>${courtName || 'Unknown'}</td>
                    <td>${startTimeReadable || 'Unknown'}</td>
                    <td>${endTimeReadable || 'Unknown'}</td>
                    <td>
                        <button class="delete-history-btn" data-id="${historyId}" style="cursor:pointer;">Delete</button>
                    </td>
                `;
                historyTbody.appendChild(row);

                // ✅ Attach delete button listener after adding the row
                row.querySelector('.delete-history-btn').addEventListener('click', async (e) => {
                    const confirm = await Swal.fire({
                        title: 'Delete History?',
                        text: 'Are you sure you want to delete this history record?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, delete it!',
                    });

                    if (confirm.isConfirmed) {
                        await remove(ref(database, `history/${historyId}`));
                        Swal.fire('Deleted!', 'History record deleted.', 'success');
                    }
                });

            }).catch(error => {
                console.error("Error loading user data for history:", error);
            });
        }
    });
}
function loadPayments() {
    const paymentsRef = ref(database, 'payments');
    const paymentsTbody = document.getElementById('PaymentsDiv');

    onValue(paymentsRef, (snapshot) => {
        paymentsTbody.innerHTML = '';

        if (!snapshot.exists()) {
            paymentsTbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; font-style:italic;">
                        No payments found
                    </td>
                </tr>
            `;
            return;
        }

        const paymentsData = snapshot.val();

        for (let paymentId in paymentsData) {
            const payments = paymentsData[paymentId];
            const { userId, payment, paymentStatus } = payments;

            const username = ref(database, "/users/" + userId + "/fullName/");
            get(username).then((snapshot) => {
                const fullName = snapshot.val();

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fullName || 'Unknown'}</td>
                    <td>₱${payment || 'Unknown'}</td>
                    <td>${paymentStatus || 'Unknown'}</td>
                    <td>
                        ${paymentStatus !== 'paid' ? `<button class="pay-now-btn" data-id="${paymentId}" style="cursor:pointer;">Paid</button>` : ''}
                        <button class="delete-payment-btn" data-id="${paymentId}" style="cursor:pointer;">Delete</button>
                    </td>
                `;
                paymentsTbody.appendChild(row);

                // ✅ Attach Paid button event if visible
                if (paymentStatus !== 'paid') {
                    row.querySelector('.pay-now-btn').addEventListener('click', async (e) => {
                        const confirm = await Swal.fire({
                            title: 'Mark as Paid?',
                            text: 'Do you want to mark this payment as paid?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, mark as paid!',
                        });

                        if (confirm.isConfirmed) {
                            await update(ref(database, `payments/${paymentId}`), { paymentStatus: 'paid' });
                            Swal.fire('Success!', 'Payment status updated to Paid.', 'success');
                        }
                    });
                }

                // ✅ Attach Delete button event
                row.querySelector('.delete-payment-btn').addEventListener('click', async (e) => {
                    const confirm = await Swal.fire({
                        title: 'Delete Payment?',
                        text: 'Are you sure you want to delete this payment record?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, delete it!',
                    });

                    if (confirm.isConfirmed) {
                        await remove(ref(database, `payments/${paymentId}`));
                        Swal.fire('Deleted!', 'Payment record deleted.', 'success');
                    }
                });

            }).catch(error => {
                console.error("Error loading user data for payments:", error);
            });
        }
    });
}
        



// Monitor and move finished reservations
function monitorReservations() {
    setInterval(() => {
        const reservationsRef = ref(database, "reservations");

        console.log("No reservations found.");

        get(reservationsRef).then((snapshot) => {
            const reservations = snapshot.val();
            const now = Date.now();
            console.log("Current timestamp:", now);

            if (reservations) {
                Object.entries(reservations).forEach(([resId, resData]) => {
                    console.log(`Checking reservation ${resId}:`, resData);
                    console.log(`Now: ${now}, EndTime: ${resData.endTime}, Expired: ${now > resData.endTime}`);

                    if (now > resData.endTime) {
                        const courtId = resData.courtId;
                        const courtRef = ref(database, `courts/${courtId}`);
                        const historyRef = ref(database, `history/${resId}`);
                        const paymentRef = ref(database, `payments/${resId}`);
                        const reservationRef = ref(database, `reservations/${resId}`);

                        update(courtRef, { status: "Available" }).then(() => {
                            set(historyRef, resData).then(() => {
                                set(paymentRef, {
                                    ...resData,
                                    paymentStatus: "not yet paid"
                                }).then(() => {
                                    remove(reservationRef);
                                    console.log(`✅ Reservation ${resId} expired and moved to history.`);
                                }).catch(err => console.error("Error saving payment info:", err));
                            }).catch(err => console.error("Error saving history:", err));
                        }).catch(err => console.error("Error updating court status:", err));
                    }
                });
            } else {
                console.log("No reservations found.");
            }
        }).catch(error => {
            console.error("Error checking reservations:", error);
        });
    }, 5 * 1000); // every 60 seconds
}


window.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    loadPayments();
    monitorReservations();
});
