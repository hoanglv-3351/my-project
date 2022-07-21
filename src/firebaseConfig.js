import {initializeApp} from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseApp = initializeApp({
    apiKey: "AIzaSyCldbD-14BOlrytzCbL1PAD1yriCBIGXaU",
    authDomain: "instagram-afde5.firebaseapp.com",
    projectId: "instagram-afde5",
    storageBucket: "instagram-afde5.appspot.com",
    messagingSenderId: "950469473949",
    appId: "1:950469473949:web:5b7499a34dd738f75c8674",
    measurementId: "G-S0JDJ4X7FD"
});

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp)

export { db, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, firebaseApp };