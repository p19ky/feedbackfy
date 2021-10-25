import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAuKLp0_rv_pKnDTDKUAy1QBi_CWfM1-10",
  authDomain: "feedbackfy.firebaseapp.com",
  projectId: "feedbackfy",
  storageBucket: "feedbackfy.appspot.com",
  messagingSenderId: "1029840063473",
  appId: "1:1029840063473:web:c2d012aa986cc864919250",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
