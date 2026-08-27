import { SchoolEvent, User, Workshop, WorkshopSession, StudentProfile } from '../types';
import { INITIAL_EVENT, DEMO_USERS, MOCK_STUDENTS_BY_CLASS } from '../data/sampleData';

const STORAGE_EVENT_KEY = 'gjk_event_data_v1';
const STORAGE_USER_KEY = 'gjk_current_user_v1';

export function getStoredEvent(): SchoolEvent {
  const saved = localStorage.getItem(STORAGE_EVENT_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse stored event', e);
    }
  }
  // Initialize with initial event
  localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(INITIAL_EVENT));
  return INITIAL_EVENT;
}

export function saveStoredEvent(event: SchoolEvent): void {
  localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(event));
}

export function getStoredUser(): User {
  const saved = localStorage.getItem(STORAGE_USER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse user', e);
    }
  }
  // Default to student 1 (Jan Novák)
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(DEMO_USERS[0]));
  return DEMO_USERS[0];
}

export function saveStoredUser(user: User): void {
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

// Convert "HH:MM" to minutes from midnight
export function timeToMinutes(t: string): number {
  if (!t) return 0;
  const parts = t.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

// Check time overlap
export function isTimeOverlapping(
  dayA: string, startA: string, endA: string,
  dayB: string, startB: string, endB: string
): boolean {
  if (dayA.toLowerCase().trim() !== dayB.toLowerCase().trim()) {
    return false;
  }
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  // Overlap condition: startA < endB && startB < endA
  return sA < eB && sB < eA;
}

// Check if student's class is eligible for workshop
export function isClassEligible(studentClass: string | undefined, targetClasses: string[]): boolean {
  if (!targetClasses || targetClasses.length === 0) return true;
  if (targetClasses.includes('Všechny') || targetClasses.includes('Všichni') || targetClasses.includes('ALL')) return true;
  if (!studentClass) return true; // if not set, assume eligible or warn

  const normalizedClass = studentClass.trim().toLowerCase();
  
  return targetClasses.some(tc => {
    const normTc = tc.trim().toLowerCase();
    if (normTc === normalizedClass) return true;
    // Check grade match e.g. "Kvinta" matches "Kvinta A" or "Kvinta B"
    if (normalizedClass.includes(normTc) || normTc.includes(normalizedClass)) return true;
    return false;
  });
}

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  conflictingWorkshopTitle?: string;
  conflictingTime?: string;
}

// Check if student can enroll in a session
export function canEnrollInSession(
  event: SchoolEvent,
  student: User,
  targetWorkshop: Workshop,
  targetSession: WorkshopSession
): ValidationResult {
  // 1. Check if already enrolled in THIS session
  if (targetSession.enrolledStudentIds.includes(student.id)) {
    return { allowed: false, reason: 'V tomto termínu už jste přihlášeni.' };
  }

  // 2. Check if already enrolled in another session of the SAME workshop
  const alreadyInSameWorkshop = targetWorkshop.sessions.some(s => s.enrolledStudentIds.includes(student.id));
  if (alreadyInSameWorkshop) {
    return { allowed: false, reason: 'Na tento program již máte zapsaný jiný termín.' };
  }

  // 3. Check Capacity
  if (targetSession.enrolledStudentIds.length >= targetSession.maxCapacity) {
    return { allowed: false, reason: 'Kapacita tohoto termínu je již plně obsazena.' };
  }

  // 4. Check Class Eligibility
  if (student.studentClass && !isClassEligible(student.studentClass, targetWorkshop.targetClasses)) {
    return { 
      allowed: false, 
      reason: `Tento program je určen pouze pro třídy: ${targetWorkshop.targetClasses.join(', ')}. Vaše třída je ${student.studentClass}.` 
    };
  }

  // 5. Check Time Collision with other enrolled workshops of this student
  for (const ws of event.workshops) {
    for (const sess of ws.sessions) {
      if (sess.enrolledStudentIds.includes(student.id)) {
        if (isTimeOverlapping(sess.day, sess.startTime, sess.endTime, targetSession.day, targetSession.startTime, targetSession.endTime)) {
          return {
            allowed: false,
            reason: `Časová kolize: V tento čas (${sess.day} ${sess.startTime}–${sess.endTime}) již máte zapsaný program "${ws.title}".`,
            conflictingWorkshopTitle: ws.title,
            conflictingTime: `${sess.day} ${sess.startTime}–${sess.endTime}`
          };
        }
      }
    }
  }

  return { allowed: true };
}

// Calculate student hours and enrolled sessions
export function getStudentProfile(event: SchoolEvent, student: User): StudentProfile {
  let totalHours = 0;
  const enrolledSessionIds: string[] = [];

  for (const ws of event.workshops) {
    for (const sess of ws.sessions) {
      if (sess.enrolledStudentIds.includes(student.id)) {
        enrolledSessionIds.push(sess.id);
        totalHours += sess.durationHours;
      }
    }
  }

  totalHours = Math.round(totalHours * 10) / 10;
  const required = event.requiredHours;

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    studentClass: student.studentClass || 'Nezadáno',
    totalEnrolledHours: totalHours,
    requiredHours: required,
    enrolledSessionIds,
    isComplete: totalHours >= required
  };
}

// Enroll student in session, handle capacity & auto-repeat opening
export function enrollStudentInSession(
  event: SchoolEvent,
  student: User,
  workshopId: string,
  sessionId: string
): { updatedEvent: SchoolEvent; autoOpenedSession?: WorkshopSession; error?: string } {
  const workshop = event.workshops.find(w => w.id === workshopId);
  if (!workshop) return { updatedEvent: event, error: 'Program nebyl nalezen.' };

  const session = workshop.sessions.find(s => s.id === sessionId);
  if (!session) return { updatedEvent: event, error: 'Termín nebyl nalezen.' };

  const check = canEnrollInSession(event, student, workshop, session);
  if (!check.allowed) {
    return { updatedEvent: event, error: check.reason };
  }

  // Clone event to avoid mutation
  const updatedEvent: SchoolEvent = JSON.parse(JSON.stringify(event));
  const updatedWorkshop = updatedEvent.workshops.find(w => w.id === workshopId)!;
  const updatedSession = updatedWorkshop.sessions.find(s => s.id === sessionId)!;

  // Add student
  updatedSession.enrolledStudentIds.push(student.id);

  let autoOpenedSession: WorkshopSession | undefined = undefined;

  // Check if session reached capacity and we have available repeat slots
  if (
    updatedSession.enrolledStudentIds.length >= updatedSession.maxCapacity &&
    updatedWorkshop.availableRepeatSlots &&
    updatedWorkshop.availableRepeatSlots.length > 0
  ) {
    // Take first available repeat slot and create new session
    const nextSlot = updatedWorkshop.availableRepeatSlots.shift();
    if (nextSlot) {
      const newSessionNum = updatedWorkshop.sessions.length + 1;
      autoOpenedSession = {
        id: `sess-${updatedWorkshop.id}-${newSessionNum}`,
        workshopId: updatedWorkshop.id,
        sessionNumber: newSessionNum,
        day: nextSlot.day,
        startTime: nextSlot.startTime,
        endTime: nextSlot.endTime,
        durationHours: nextSlot.durationHours,
        room: nextSlot.room,
        maxCapacity: updatedSession.maxCapacity,
        enrolledStudentIds: [],
        isAutoOpened: true
      };

      updatedWorkshop.sessions.push(autoOpenedSession);
    }
  }

  saveStoredEvent(updatedEvent);
  return { updatedEvent, autoOpenedSession };
}

// Unenroll student from session
export function unenrollStudentFromSession(
  event: SchoolEvent,
  studentId: string,
  workshopId: string,
  sessionId: string
): SchoolEvent {
  const updatedEvent: SchoolEvent = JSON.parse(JSON.stringify(event));
  const updatedWorkshop = updatedEvent.workshops.find(w => w.id === workshopId);
  if (!updatedWorkshop) return event;

  const updatedSession = updatedWorkshop.sessions.find(s => s.id === sessionId);
  if (!updatedSession) return event;

  updatedSession.enrolledStudentIds = updatedSession.enrolledStudentIds.filter(id => id !== studentId);
  saveStoredEvent(updatedEvent);
  return updatedEvent;
}

// Helper to get all students in a class and their completion stats
export function getClassEnrollmentSummary(event: SchoolEvent, className: string) {
  const students = MOCK_STUDENTS_BY_CLASS[className] || [];
  
  return students.map(st => {
    const fakeUser: User = {
      id: st.id,
      name: st.name,
      email: st.email,
      role: 'student',
      studentClass: className
    };
    const profile = getStudentProfile(event, fakeUser);
    
    // Find enrolled workshops
    const enrolledWorkshops: { title: string; day: string; time: string; room: string; hours: number }[] = [];
    for (const ws of event.workshops) {
      for (const sess of ws.sessions) {
        if (sess.enrolledStudentIds.includes(st.id)) {
          enrolledWorkshops.push({
            title: ws.title,
            day: sess.day,
            time: `${sess.startTime} - ${sess.endTime}`,
            room: sess.room,
            hours: sess.durationHours
          });
        }
      }
    }

    return {
      student: fakeUser,
      profile,
      enrolledWorkshops
    };
  });
}
