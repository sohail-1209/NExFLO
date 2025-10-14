import type { Event, Registration } from './types';

// In-memory store
let events: Event[] = [
  {
    id: 'cl-event-1',
    name: 'Next.js Global Summit',
    description: 'Join us for a deep dive into the latest features of Next.js, with workshops from the core team and community experts. A full day of learning, networking, and fun!',
    date: new Date('2024-10-26T09:00:00'),
    confirmationMessage: 'Thanks for registering! Your spot is pending task submission. Please complete the attached challenge to confirm your booking.',
    taskPdfUrl: '/mock-task.pdf'
  },
  {
    id: 'cl-event-2',
    name: 'AI in Web Development',
    description: 'Explore how to integrate generative AI into modern web applications. This is a hands-on workshop for developers looking to build the next generation of intelligent apps.',
    date: new Date('2024-11-15T10:00:00'),
    confirmationMessage: 'You are on the list! To secure your place, please complete the task provided in the link below. We can\'t wait to see what you build.',
    taskPdfUrl: '/mock-task.pdf'
  }
];

let registrations: Registration[] = [
    {
        id: 'reg-1',
        eventId: 'cl-event-1',
        studentName: 'Alice Johnson',
        studentEmail: 'alice@example.com',
        rollNumber: 'A123',
        gender: 'Female',
        branch: 'Computer Science',
        yearOfStudy: 3,
        mobileNumber: '123-456-7890',
        status: 'booked',
        taskSubmission: 'https://github.com/example/alice-submission',
        registeredAt: new Date('2024-09-01T10:00:00'),
        attended: true,
        laptop: true,
    },
    {
        id: 'reg-2',
        eventId: 'cl-event-1',
        studentName: 'Bob Williams',
        studentEmail: 'bob@example.com',
        rollNumber: 'B456',
        gender: 'Male',
        branch: 'Electrical Engineering',
        yearOfStudy: 2,
        mobileNumber: '234-567-8901',
        status: 'waitlisted',
        taskSubmission: 'https://github.com/example/bob-submission',
        registeredAt: new Date('2024-09-02T11:30:00'),
        attended: false,
        laptop: false,
    },
    {
        id: 'reg-3',
        eventId: 'cl-event-1',
        studentName: 'Charlie Brown',
        studentEmail: 'charlie@example.com',
        rollNumber: 'C789',
        gender: 'Male',
        branch: 'Mechanical Engineering',
        yearOfStudy: 4,
        mobileNumber: '345-678-9012',
        status: 'pending',
        taskSubmission: null,
        registeredAt: new Date('2024-09-03T14:00:00'),
        attended: false,
        laptop: true,
    },
    {
        id: 'reg-4',
        eventId: 'cl-event-1',
        studentName: 'Diana Prince',
        studentEmail: 'diana@example.com',
        rollNumber: 'D012',
        gender: 'Female',
        branch: 'Civil Engineering',
        yearOfStudy: 3,
        mobileNumber: '456-789-0123',
        status: 'booked',
        taskSubmission: 'https://github.com/example/diana-submission',
        registeredAt: new Date('2024-09-01T15:00:00'),
        attended: false,
        laptop: false,
    }
];

// Data access functions
export const getEvents = async (): Promise<Event[]> => {
  return events;
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  return events.find(event => event.id === id);
};

export const getRegistrationsByEventId = async (eventId: string): Promise<Registration[]> => {
  return registrations
    .filter(reg => reg.eventId === eventId)
    .sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime());
};

export const getRegistrationById = async (id:string): Promise<Registration | undefined> => {
    return registrations.find(reg => reg.id === id);
}

export const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
  const newEvent: Event = {
    ...eventData,
    id: `cl-event-${Date.now()}`,
  };
  events.push(newEvent);
  return newEvent;
};

export const createRegistration = async (regData: Omit<Registration, 'id' | 'registeredAt' | 'status' | 'taskSubmission' | 'attended'>): Promise<Registration> => {
  const newRegistration: Registration = {
    ...regData,
    id: `reg-${Date.now()}`,
    registeredAt: new Date(),
    status: 'pending',
    taskSubmission: null,
    attended: false,
  };
  registrations.push(newRegistration);
  return newRegistration;
};

export const updateRegistration = async (id: string, updates: Partial<Registration>): Promise<Registration | undefined> => {
  const index = registrations.findIndex(reg => reg.id === id);
  if (index !== -1) {
    registrations[index] = { ...registrations[index], ...updates };
    return registrations[index];
  }
  return undefined;
};
