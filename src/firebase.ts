// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQnWIHi_k4QO00KDnLDJnjmkUrs9rz_eg",
    authDomain: "puyo-d0896.firebaseapp.com",
    projectId: "puyo-d0896",
    storageBucket: "puyo-d0896.firebasestorage.app",
    messagingSenderId: "525417468819",
    appId: "1:525417468819:web:42f4b0b39cd675a1ab0e66",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
