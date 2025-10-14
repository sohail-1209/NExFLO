export type Event = {
  id: string;
  name: string;
  description: string;
  date: Date;
  confirmationMessage: string;
  taskPdfUrl: string;
};

export type Registration = {
  id: string;
  eventId: string;
  studentName: string;
  studentEmail: string;
  status: 'pending' | 'booked' | 'waitlisted';
  taskSubmission: string | null;
  registeredAt: Date;
  attended: boolean;
};
