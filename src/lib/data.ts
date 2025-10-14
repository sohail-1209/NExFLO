

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeFirebase } from "@/firebase";
import type { Event, Registration } from './types';

// Initialize Firebase services
const { firestore, storage } = initializeFirebase();
const db = firestore;

// Type converters for Firestore
const eventConverter = {
  toFirestore: (event: Omit<Event, 'id'>) => {
    return {
      ...event,
      date: Timestamp.fromDate(event.date),
    };
  },
  fromFirestore: (snapshot: any, options: any): Event => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      description: data.description,
      date: data.date.toDate(),
      confirmationMessage: data.confirmationMessage,
      taskPdfUrl: data.taskPdfUrl,
      mailSubject: data.mailSubject,
      mailBody: data.mailBody,
      passSubject: data.passSubject,
      passBody: data.passBody,
    };
  },
};

const registrationConverter = {
  toFirestore: (registration: Omit<Registration, 'id'>) => {
     const { registeredAt, taskSubmittedAt, attendedAt, ...rest } = registration;
    return {
      ...rest,
      registeredAt: registeredAt ? Timestamp.fromDate(registeredAt) : serverTimestamp(),
      taskSubmittedAt: taskSubmittedAt ? Timestamp.fromDate(taskSubmittedAt) : null,
      attendedAt: attendedAt ? Timestamp.fromDate(attendedAt) : null,
    };
  },
  fromFirestore: (snapshot: any, options: any): Registration => {
    const data = snapshot.data(options);
    return {
        id: snapshot.id,
        eventId: data.eventId,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        rollNumber: data.rollNumber,
        gender: data.gender,
        branch: data.branch,
        yearOfStudy: data.yearOfStudy,
        mobileNumber: data.mobileNumber,
        status: data.status,
        taskSubmission: data.taskSubmission,
        taskSubmittedAt: data.taskSubmittedAt ? data.taskSubmittedAt.toDate() : null,
        registeredAt: data.registeredAt.toDate(),
        attended: data.attended,
        attendedAt: data.attendedAt ? data.attendedAt.toDate() : null,
        laptop: data.laptop,
    };
  },
};


// Data access functions
export const getEvents = async (): Promise<Event[]> => {
  const eventsCol = collection(db, 'events').withConverter(eventConverter);
  const q = query(eventsCol, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  const eventDocRef = doc(db, 'events', id).withConverter(eventConverter);
  const docSnap = await getDoc(eventDocRef);
  return docSnap.exists() ? docSnap.data() : undefined;
};

export const getRegistrationsByEventId = async (eventId: string): Promise<Registration[]> => {
  const registrationsCol = collection(db, 'registrations').withConverter(registrationConverter);
  const q = query(registrationsCol, where("eventId", "==", eventId), orderBy("registeredAt", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

export const getRegistrationById = async (id:string): Promise<Registration | undefined> => {
    const regDocRef = doc(db, 'registrations', id).withConverter(registrationConverter);
    const docSnap = await getDoc(regDocRef);
    return docSnap.exists() ? docSnap.data() : undefined;
}

type CreateEventData = Omit<Event, 'id' | 'taskPdfUrl'> & { 
  taskPdfFile: File;
};

export const createEventInData = async (eventData: CreateEventData): Promise<Event> => {
  const { taskPdfFile, ...restData } = eventData as any;

  // Upload task PDF to Firebase Storage
  const taskPdfStorageRef = ref(storage, `tasks/${Date.now()}-${taskPdfFile.name}`);
  const taskUploadResult = await uploadBytes(taskPdfStorageRef, taskPdfFile);
  const taskPdfUrl = await getDownloadURL(taskUploadResult.ref);

  const newEventData = {
    ...restData,
    taskPdfUrl,
  };

  const eventsCol = collection(db, 'events').withConverter(eventConverter);
  const docRef = await addDoc(eventsCol, newEventData);
  
  return { ...newEventData, id: docRef.id };
};

export const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id'>>) => {
    const eventDocRef = doc(db, 'events', id);
    await updateDoc(eventDocRef, updates);
};


export const createRegistration = async (regData: Omit<Registration, 'id' | 'registeredAt' | 'status' | 'taskSubmission' | 'attended' | 'taskSubmittedAt' | 'attendedAt'>): Promise<Registration> => {
  const newRegistrationData: Omit<Registration, 'id'> = {
    ...regData,
    registeredAt: new Date(),
    status: 'pending',
    taskSubmission: null,
    taskSubmittedAt: null,
    attended: false,
    attendedAt: null,
  };

  const registrationsCol = collection(db, 'registrations').withConverter(registrationConverter);
  const docRef = await addDoc(registrationsCol, newRegistrationData);

  return { ...newRegistrationData, id: docRef.id, registeredAt: newRegistrationData.registeredAt as Date };
};

export const updateRegistration = async (id: string, updates: Partial<Registration>): Promise<Registration | undefined> => {
  const regDocRef = doc(db, 'registrations', id).withConverter(registrationConverter);
  await updateDoc(regDocRef, updates);
  const updatedDoc = await getDoc(regDocRef);
  return updatedDoc.exists() ? updatedDoc.data() : undefined;
};
