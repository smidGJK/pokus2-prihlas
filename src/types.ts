export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  studentClass?: string; // e.g. "3.A", "Sexta B", "Kvinta"
}

export type WorkshopCategory = 
  | 'Přírodní vědy'
  | 'Společenské vědy'
  | 'Jazyky & Literatura'
  | 'IT & Technologie'
  | 'Umění & Tvorba'
  | 'Sport & Zdraví'
  | 'Osobní rozvoj & Kariéra';

export interface RepeatSlot {
  id: string;
  day: string; // e.g. "Čtvrtek", "Pátek"
  startTime: string; // e.g. "12:30"
  endTime: string; // e.g. "14:00"
  room: string;
  durationHours: number;
}

export interface WorkshopSession {
  id: string;
  workshopId: string;
  sessionNumber: number; // 1, 2, 3...
  day: string; // e.g. "Čtvrtek", "Pátek"
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "10:00"
  durationHours: number; // e.g. 1.5 or 2
  room: string;
  maxCapacity: number;
  enrolledStudentIds: string[];
  isAutoOpened?: boolean; // True if opened dynamically when session 1 filled up
}

export interface Workshop {
  id: string;
  code: string;
  title: string;
  teacherName: string;
  teacherEmail: string;
  description: string;
  requirements?: string;
  category: WorkshopCategory;
  targetClasses: string[]; // ["Všechny"] or specific e.g. ["Kvinta", "Sexta", "3.A", "3.B"]
  sessions: WorkshopSession[];
  availableRepeatSlots?: RepeatSlot[]; // Extra teacher slots that can auto-open if session fills
}

export interface EventScheduleTimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  label: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  code: string;
  subtitle: string;
  description: string;
  dateRange: string; // e.g. "23. - 24. října 2026"
  days: string[]; // ["Čtvrtek", "Pátek"]
  requiredHours: number; // e.g. 6.0
  googleSheetUrl?: string;
  registrationDeadline: string;
  isOpen: boolean;
  workshops: Workshop[];
}

export interface EnrollmentRecord {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentClass: string;
  workshopId: string;
  sessionId: string;
  enrolledAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  studentClass: string;
  totalEnrolledHours: number;
  requiredHours: number;
  enrolledSessionIds: string[];
  isComplete: boolean;
}
