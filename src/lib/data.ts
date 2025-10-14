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
import { db } from "@/firebase/firestore";
import type { Event, Registration } from './types';

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
    };
  },
};

const registrationConverter = {
  toFirestore: (registration: Omit<Registration, 'id'>) => {
     const { registeredAt, ...rest } = registration;
    return {
      ...rest,
      registeredAt: registeredAt ? Timestamp.fromDate(registeredAt) : serverTimestamp(),
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
        registeredAt: data.registeredAt.toDate(),
        attended: data.attended,
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

export const createEvent = async (eventData: Omit<Event, 'id' | 'taskPdfUrl'> & { taskPdfFile: File }): Promise<Event> => {
  const { taskPdfFile, ...restData } = eventData;
  const storage = getStorage();

  // Upload file to Firebase Storage
  const storageRef = ref(storage, `tasks/${Date.now()}-${taskPdfFile.name}`);
  const uploadResult = await uploadBytes(storageRef, taskPdfFile);
  const taskPdfUrl = await getDownloadURL(uploadResult.ref);

  const newEventData = {
    ...restData,
    taskPdfUrl
  };

  const eventsCol = collection(db, 'events').withConverter(eventConverter);
  const docRef = await addDoc(eventsCol, newEventData);
  
  return { ...newEventData, id: docRef.id };
};

export const createRegistration = async (regData: Omit<Registration, 'id' | 'registeredAt' | 'status' | 'taskSubmission' | 'attended'>): Promise<Registration> => {
  const newRegistrationData: Omit<Registration, 'id'> = {
    ...regData,
    registeredAt: new Date(),
    status: 'pending',
    taskSubmission: null,
    attended: false,
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
