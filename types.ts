export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT'
}

export enum ActivityType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  PHOTO = 'PHOTO',
  MEAL = 'MEAL',
  NAP = 'NAP',
  INCIDENT = 'INCIDENT',
  NOTE = 'NOTE',
  MEDICATION = 'MEDICATION'
}

export type EnrollmentStatus = 'ENROLLED' | 'WAITLIST' | 'PENDING' | 'ARCHIVED';

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  classroom: string;
  classroomId: string;
  status: 'PRESENT' | 'ABSENT' | 'CHECKED_OUT';
  enrollmentStatus: EnrollmentStatus;
  lastActivityTime?: string;
  allergies?: string[];
  dob?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  childId: string;
  type: ActivityType;
  title: string;
  description?: string;
  mediaUrl?: string;
  timestamp: string;
  authorName: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string; // e.g. "Lead Teacher", "Assistant"
  email: string;
  phone: string;
  avatarUrl: string;
  bio?: string;
  joinedDate: string;
  assignedClassroomIds: string[];
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
  staffIds: string[]; // Reference to StaffMember IDs
}

export interface Guardian {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  avatarUrl: string;
}

export interface Invoice {
  id: string;
  title: string;
  amount: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
}

// --- HEALTH MODULE TYPES ---

export interface Immunization {
  id: string;
  name: string;
  dueDate: string;
  dateGiven?: string;
  status: 'COMPLIANT' | 'OVERDUE' | 'UPCOMING';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  lastAdministered?: string;
  endDate?: string;
}

export interface HealthProfile {
  childId: string;
  bloodType?: string;
  doctorName?: string;
  doctorPhone?: string;
  immunizations: Immunization[];
  medications: Medication[];
  specialNeeds?: string;
}

// --- SCHEDULING TYPES ---

export type ShiftType = 'OPEN' | 'MID' | 'CLOSE' | 'OFF';

export interface ShiftAssignment {
  staffId: string;
  day: string; // 'Mon', 'Tue', etc.
  type: ShiftType;
}