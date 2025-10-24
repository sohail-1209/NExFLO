
export type Event = {
  id: string;
  name: string;
  description: string;
  date: Date;
  venue: string;
  confirmationMessage: string;
  taskPdfUrl: string | null;
  mailSubject: string;
  mailBody: string;
  passSubject: string;
  passBody: string;
  appMail?: string;
  appPass?: string;
  isLive: boolean;
  allowedYears: number[];
};

export type Registration = {
  id: string;
  eventId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  gender: string;
  branch: string;
  yearOfStudy: number;
  mobileNumber: string;
  status: 'pending' | 'booked' | 'waitlisted' | 'denied';
  taskSubmission: string | null;
  taskSubmittedAt: Date | null;
  registeredAt: Date;
  attended: boolean;
  attendedAt: Date | null;
  laptop: boolean;
};
