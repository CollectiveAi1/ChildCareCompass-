import { Child } from '../types';

export const demoChildren: Child[] = [
  {
    id: 'child-1',
    firstName: 'Emma',
    lastName: 'Johnson',
    dob: '2022-03-15',
    status: 'ABSENT',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    allergies: ['Peanuts'],
    classroom: 'Toddlers 1A',
    classroomId: 'toddlers',
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: undefined,
  },
  {
    id: 'child-2',
    firstName: 'Liam',
    lastName: 'Smith',
    dob: '2022-05-20',
    status: 'ABSENT',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    allergies: [],
    classroom: 'Toddlers 1A',
    classroomId: 'toddlers',
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: undefined,
  },
  {
    id: 'child-3',
    firstName: 'Olivia',
    lastName: 'Williams',
    dob: '2021-11-08',
    status: 'ABSENT',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    allergies: ['Dairy'],
    classroom: 'Toddlers 1A',
    classroomId: 'toddlers',
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: undefined,
  },
  {
    id: 'child-4',
    firstName: 'Noah',
    lastName: 'Brown',
    dob: '2022-07-12',
    status: 'ABSENT',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    allergies: [],
    classroom: 'Toddlers 1A',
    classroomId: 'toddlers',
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: undefined,
  },
  {
    id: 'child-5',
    firstName: 'Ava',
    lastName: 'Davis',
    dob: '2023-01-25',
    status: 'ABSENT',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    allergies: ['Eggs'],
    classroom: 'Infants',
    classroomId: 'infants',
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: undefined,
  },
  {
    id: 'child-6',
    firstName: 'Ethan',
    lastName: 'Miller',
    dob: '2023-03-18',
    status: 'ABSENT',
    avatarUrl: 'https://i.pravatar.cc/150?img=6',
    allergies: [],
    classroom: 'Infants',
    classroomId: 'infants',
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: undefined,
  },
  {
    id: 'child-7',
    firstName: 'Sophia',
    lastName: 'Garcia',
    dob: '2023-05-09',
    status: 'ABSENT',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    allergies: [],
    classroom: 'Infants',
    classroomId: 'infants',
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: undefined,
  },
  {
    id: 'child-8',
    firstName: 'Mason',
    lastName: 'Martinez',
    dob: '2022-09-14',
    status: 'ABSENT',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    allergies: ['Shellfish'],
    classroom: 'Toddlers 1A',
    classroomId: 'toddlers',
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: undefined,
  },
];

// Store demo data in memory during the session
let demoChildrenState = [...demoChildren];

export const getDemoChildren = (classroom?: string): Child[] => {
  if (classroom) {
    return demoChildrenState.filter(child => child.classroomId === classroom);
  }
  return [...demoChildrenState];
};

export const updateDemoChildStatus = (childId: string, status: 'PRESENT' | 'ABSENT' | 'CHECKED_OUT'): Child | null => {
  const child = demoChildrenState.find(c => c.id === childId);
  if (child) {
    child.status = status;
    child.lastActivityTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return child;
  }
  return null;
};

export const resetDemoData = () => {
  demoChildrenState = demoChildren.map(child => ({
    ...child,
    status: 'ABSENT' as const,
    lastActivityTime: undefined,
  }));
};
