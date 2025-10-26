

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
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

// Initialize Firebase services
const { firestore, storage } = initializeFirebase();
const db = firestore;

// Type converters for Firestore
const eventConverter = {
  toFirestore: (event: Partial<Omit<Event, 'id'>>) => {
    const data: any = { ...event };
     if (event.date) {
        data.date = Timestamp.fromDate(event.date);
    }
    // Remove undefined fields so Firestore doesn't store them
    if (data.appMail === undefined) delete data.appMail;
    if (data.appPass === undefined) delete data.appPass;
    if (data.taskPdfUrl === undefined) delete data.taskPdfUrl;
    if (data.allowedYears === undefined) delete data.allowedYears;
    if (data.primaryColor === undefined) delete data.primaryColor;
    if (data.accentColor === undefined) delete data.accentColor;


    return data;
  },
  fromFirestore: (snapshot: any, options: any): Event => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      description: data.description,
      date: data.date.toDate(),
      venue: data.venue,
      confirmationMessage: data.confirmationMessage,
      taskPdfUrl: data.taskPdfUrl || null,
      mailSubject: data.mailSubject,
      mailBody: data.mailBody,
      passSubject: data.passSubject,
      passBody: data.passBody,
      appMail: data.appMail,
      appPass: data.appPass,
      isLive: data.isLive === undefined ? true : data.isLive, // Default to true if not set
      allowedYears: data.allowedYears || [], // Default to empty array
      primaryColor: data.primaryColor,
      accentColor: data.accentColor,
    };
  },
};

const registrationConverter = {
  toFirestore: (registration: Partial<Registration> & {id?: string}) => {
     const { registeredAt, taskSubmittedAt, attendedAt, id, ...rest } = registration;
    const data: any = { ...rest };

    if (registeredAt) data.registeredAt = Timestamp.fromDate(new Date(registeredAt));
    if (taskSubmittedAt) data.taskSubmittedAt = Timestamp.fromDate(new Date(taskSubmittedAt));
    if (attendedAt) data.attendedAt = Timestamp.fromDate(new Date(attendedAt));
    
    // For new documents, ensure serverTimestamp is used if registeredAt is not provided
    if (!id && !registeredAt) {
      data.registeredAt = serverTimestamp();
    }
    
    return data;
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

type CreateEventData = Omit<Event, 'id' | 'taskPdfUrl' | 'isLive'> & { 
  taskPdfFile: File | null;
};

export const createEventInData = async (eventData: CreateEventData): Promise<Event> => {
  const { taskPdfFile, ...restData } = eventData as any;

  let taskPdfUrl: string | null = null;
  if (taskPdfFile && taskPdfFile.size > 0) {
    const taskPdfStorageRef = ref(storage, `tasks/${Date.now()}-${taskPdfFile.name}`);
    const taskUploadResult = await uploadBytes(taskPdfStorageRef, taskPdfFile);
    taskPdfUrl = await getDownloadURL(taskUploadResult.ref);
  }
  
  const newEventData: Omit<Event, 'id'> = {
    ...restData,
    taskPdfUrl,
    isLive: true, // Default to live
    passSubject: restData.passSubject || "Your Event Pass for {eventName}",
    passBody: restData.passBody || "Hi {studentName},\n\nHere is your event pass. Please have it ready for check-in.\n\nThank you!",
  };

  const eventsCol = collection(db, 'events').withConverter(eventConverter);
  
  // The addDoc promise is handled by the .catch block, no need to await here
  const docRefPromise = addDoc(eventsCol, newEventData).catch(error => {
      const permissionError = new FirestorePermissionError({
          path: eventsCol.path,
          operation: 'create',
          requestResourceData: newEventData,
      });
      errorEmitter.emit('permission-error', permissionError);
      // Re-throw the original error to ensure the UI knows something went wrong
      throw error;
  });

  const docRef = await docRefPromise;

  return { ...newEventData, id: docRef.id, date: newEventData.date };
};

export const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id'>>) => {
    const eventDocRef = doc(db, 'events', id);
    const convertedUpdates = eventConverter.toFirestore(updates);
    await updateDoc(eventDocRef, convertedUpdates);
};


export const createRegistration = async (regData: Omit<Registration, 'id' | 'registeredAt' | 'status' | 'taskSubmission' | 'attended' | 'taskSubmittedAt' | 'attendedAt'>, taskRequired: boolean): Promise<Registration> => {
  const newRegistrationData: Omit<Registration, 'id'> = {
    ...regData,
    registeredAt: new Date(),
    status: taskRequired ? 'pending' : 'booked',
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
  const regDocRef = doc(db, 'registrations', id);
  // Using the converter's toFirestore to handle date conversions
  const convertedUpdates = registrationConverter.toFirestore(updates);
  await updateDoc(regDocRef, convertedUpdates);
  const updatedDoc = await getDoc(regDocRef.withConverter(registrationConverter));
  return updatedDoc.exists() ? updatedDoc.data() : undefined;
};
