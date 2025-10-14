export type Event = {
  id: string;
  name: string;
  description: string;
  date: Date;
  confirmationMessage: string;
  taskPdfUrl: string;
  mailSubject: string;
  mailBody: string;
  passSubject: string;
  passBody: string;
  passLayoutUrl: string;
  nameX: number;
  nameY: number;
  rollNumberX: number;
  rollNumberY: number;
  branchX: number;
  branchY: number;
  statusX: number;
  statusY: number;
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
  status: 'pending' | 'booked' | 'waitlisted';
  taskSubmission: string | null;
  registeredAt: Date;
  attended: boolean;
  laptop: boolean;
};
