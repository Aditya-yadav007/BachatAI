
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"

const firebaseConfig = {
    apiKey: "AIzaSyAERz_2ftI7R-FV8n7sJPGNEWF66IsyK08",
    authDomain: "loginpage-50d11.firebaseapp.com",
    projectId: "loginpage-50d11",
    storageBucket: "loginpage-50d11.firebasestorage.app",
    messagingSenderId: "550029700670",
    appId: "1:550029700670:web:bd8ae0ff49c7c936dbab6f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        console.log(user);
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.getElementById('loggedUserFName').innerText = userData.firstName;
                    document.getElementById('loggedUserFName1').innerText = userData.firstName;
                    document.getElementById('loggedUserEmail').innerText = userData.email;
                    document.getElementById('dob').innerText = userData.dob;
                    document.getElementById('gender').innerText = userData.gender;
                    document.getElementById('mobile').innerText = userData.mobile;
                    document.getElementById('address').innerText = userData.address;
                    document.getElementById('aadhar').innerText = userData.aadhar;
                    document.getElementById('bankName').innerText = userData.bankName;
                    document.getElementById('accountNumber').innerText = userData.accountNumber;
                    document.getElementById('accountType').innerText = userData.accountType;

                }
                else {
                    console.log("no document found matching id")
                }
            })
            .catch((error) => {
                console.log("Error getting document");
            })
    }
    else {
        console.log("User Id not Found in Local storage")
    }
})

// const logoutButton = document.getElementById('logout');
document.getElementById('logout').addEventListener('click', function () {
    const confirmLogout = confirm('Are you sure you want to logout?');

    if (confirmLogout) {
        localStorage.removeItem('loggedInUserId');
        signOut(auth)
            .then(() => {
                window.location.href = '../signin/index.html'; // Use a relative path
            })
            .catch((error) => {
                console.error('Error signing out:', error);
            });
    } else {
        console.log('Logout cancelled by user.');
    }
});