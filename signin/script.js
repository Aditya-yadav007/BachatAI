// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAERz_2ftI7R-FV8n7sJPGNEWF66IsyK08",
    authDomain: "loginpage-50d11.firebaseapp.com",
    projectId: "loginpage-50d11",
    storageBucket: "loginpage-50d11.firebasestorage.app",
    messagingSenderId: "550029700670",
    appId: "1:550029700670:web:bd8ae0ff49c7c936dbab6f"
};

const app = initializeApp(firebaseConfig);

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}
const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;
    const mobile = document.getElementById('mobile').value;
    const address = document.getElementById('address').value;
    const aadhar = document.getElementById('aadhar').value;
    const bankName = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const accountType = document.getElementById('accountType').value;


    const auth = getAuth();
    const db = getFirestore();

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData = {
                email: email,
                firstName: firstName,
                dob: dob,
                gender: gender,
                mobile: mobile,
                address: address,
                aadhar: aadhar,
                bankName: bankName,
                accountNumber: accountNumber,
                accountType: accountType
            };
            showMessage('Account Created Successfully', 'signUpMessage');
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
                .then(() => {
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("error writing document", error);

                });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists !!!', 'signUpMessage');
            }
            else {
                showMessage('unable to create User', 'signUpMessage');
            }
        })
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const auth = getAuth();

    if (email == "admin@admin.com" && password == "admin123") {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                showMessage('login is successful', 'signInMessage');
                const user = userCredential.user;
                localStorage.setItem('loggedInUserId', user.uid);
                window.location.href = '../admin_page/dashboard.html';

            })

            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/invalid-credential') {
                    showMessage('Incorrect Email or Password', 'signInMessage');
                }
                else {
                    showMessage('Account does not Exist', 'signInMessage');
                }
            })
    }
    else {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                showMessage('login is successful', 'signInMessage');
                const user = userCredential.user;
                localStorage.setItem('loggedInUserId', user.uid);
                window.location.href = '../user_page/dashboard.html';

            })

            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/invalid-credential') {
                    showMessage('Incorrect Email or Password', 'signInMessage');
                }
                else {
                    showMessage('Account does not Exist', 'signInMessage');
                }
            })
    }
})