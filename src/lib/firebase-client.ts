// IMPORTANT: This file should only be imported on the client side
import { app as firebaseApp } from "./firebase";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
