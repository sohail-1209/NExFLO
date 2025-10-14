"use client";

import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { initializeFirebase } from ".";

const { firestore } = initializeFirebase();

export const db = firestore;
