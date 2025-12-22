import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { NestCard } from './components/NestCard';
import { ActivityFeedItem } from './components/ActivityFeedItem';
import { Child, Activity, ActivityType, Guardian, Invoice, Classroom, EnrollmentStatus, HealthProfile, Immunization, Medication, StaffMember, UserRole, ShiftAssignment, ShiftType } from './types';

// --- MOCK DATA ---

const CENTERS = [
  { id: 'c1', name: 'Sunny Vale Academy' },
  { id: 'c2', name: 'North Hills Campus' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 's1',
    name: 'Ms. Frizzle',
    role: 'Lead Teacher',
    email: 'frizzle@sunnyvale.edu',
    phone: '555-0201',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frizzle',
    bio: 'Dedicated to making every day a field trip. Expert in STEM and magical school buses. Believes that "getting messy" is the best way to learn.',
    joinedDate: '2021-08-15',
    assignedClassroomIds: ['toddlers', 'preschool']
  },
  {
    id: 's2',
    name: 'Mr. Rogers',
    role: 'Co-Teacher',
    email: 'rogers@sunnyvale.edu',
    phone: '555-0202',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rogers',
    bio: 'Focuses on emotional intelligence and community building. "It is a beautiful day in this neighborhood."',
    joinedDate: '2022-01-10',
    assignedClassroomIds: ['infants']
  },
  {
    id: 's3',
    name: 'Chef Bob',
    role: 'Nutrition Lead',
    email: 'bob@sunnyvale.edu',
    phone: '555-0303',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    bio: 'Nutritious meals are the fuel for curiosity.',
    joinedDate: '2022-03-05',
    assignedClassroomIds: []
  }
];

const INITIAL_SHIFTS: ShiftAssignment[] = [
  { staffId: 's1', day: 'Mon', type: 'OPEN' },
  { staffId: 's1', day: 'Tue', type: 'OPEN' },
  { staffId: 's1', day: 'Wed', type: 'MID' },
  { staffId: 's1', day: 'Thu', type: 'CLOSE' },
  { staffId: 's1', day: 'Fri', type: 'CLOSE' },
  { staffId: 's2', day: 'Mon', type: 'MID' },
  { staffId: 's2', day: 'Tue', type: 'MID' },
  { staffId: 's2', day: 'Wed', type: 'CLOSE' },
  { staffId: 's2', day: 'Thu', type: 'OPEN' },
  { staffId: 's2', day: 'Fri', type: 'OPEN' },
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 'infants', name: 'Infants', enrolled: 12, capacity: 15, staffIds: ['s2'] },
  { id: 'toddlers', name: 'Toddlers 1A', enrolled: 3, capacity: 5, staffIds: ['s1'] },
  { id: 'preschool', name: 'Preschool', enrolled: 22, capacity: 24, staffIds: ['s1'] },
];

const INITIAL_CHILDREN: Child[] = [
  { 
    id: '1', 
    firstName: 'Leo', 
    lastName: 'Dasher', 
    avatarUrl: 'https://picsum.photos/200/200?random=1', 
    classroom: 'Toddlers 1A', 
    classroomId: 'toddlers', 
    status: 'PRESENT', 
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: '10m ago', 
    allergies: ['Peanuts'], 
    dob: '2020-05-12',
    notes: 'Leo loves building blocks and outdoor play.'
  },
  { id: 'w1', firstName: 'Cooper', lastName: 'Waites', avatarUrl: 'https://picsum.photos/200/200?random=50', classroom: 'Toddlers 1A', classroomId: 'toddlers', status: 'ABSENT', enrollmentStatus: 'WAITLIST', dob: '2021-02-10', notes: 'First on the list.' },
  { id: 'w2', firstName: 'Daisy', lastName: 'Miller', avatarUrl: 'https://picsum.photos/200/200?random=51', classroom: 'Toddlers 1A', classroomId: 'toddlers', status: 'ABSENT', enrollmentStatus: 'WAITLIST', dob: '2021-03-15', notes: 'Second on the list.' },
  { id: 'p1', firstName: 'Oliver', lastName: 'Twist', avatarUrl: 'https://picsum.photos/200/200?random=101', classroom: 'Unassigned', classroomId: 'unassigned', status: 'ABSENT', enrollmentStatus: 'PENDING', dob: '2021-06-15', notes: 'Application submitted.' },
];

const INITIAL_LEADS = [
  { id: 'l1', parentName: 'Julia Grant', childName: 'Emma', status: 'Inquiry', source: 'Facebook', value: 1200, date: '2023-11-20' },
  { id: 'l2', parentName: 'Mark Spencer', childName: 'Toby', status: 'Tour Scheduled', source: 'Google', value: 1400, date: '2023-11-22' },
  { id: 'l3', parentName: 'Sarah Jenkins', childName: 'Lily', status: 'Waitlist', source: 'Referral', value: 1200, date: '2023-11-15' },
];

const INITIAL_GUARDIANS: Record<string, Guardian[]> = {
  '1': [{ id: 'g1', name: 'Sarah Dasher', relation: 'Mother', phone: '555-0101', email: 'sarah@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=g1' }],
  'w1': [{ id: 'gw1', name: 'Ben Waites', relation: 'Father', phone: '555-9901', email: 'ben@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=gw1' }],
  'w2': [{ id: 'gw2', name: 'Jane Miller', relation: 'Mother', phone: '555-9902', email: 'jane@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=gw2' }],
};

const INITIAL_HEALTH_PROFILES: Record<string, HealthProfile> = {
  '1': {
    childId: '1',
    bloodType: 'O+',
    doctorName: 'Dr. Julian Smith',
    doctorPhone: '555-0922',
    specialNeeds: 'No dairy. Severe peanut allergy. Uses inhaler for exercise-induced asthma.',
    immunizations: [
      { id: 'i1', name: 'MMR', dueDate: '2023-10-01', dateGiven: '2023-10-05', status: 'COMPLIANT' },
      { id: 'i2', name: 'DTaP', dueDate: '2024-05-01', status: 'UPCOMING' }
    ],
    medications: [
      { id: 'm1', name: 'EpiPen Jr', dosage: '0.15mg', frequency: 'Emergency Only', instructions: 'Administer in outer mid-thigh if anaphylaxis is suspected. Call 911 immediately after.' },
      { id: 'm2', name: 'Albuterol', dosage: '2 puffs', frequency: 'As needed', instructions: 'Before playground time if wheezing.' }
    ]
  }
};

interface NotificationLog {
  id: string;
  type: 'SMS' | 'EMAIL';
  recipient: string;
  subject: string;
  timestamp: string;
  status: 'SENT' | 'FAILED';
}

type ChildDetailTab = 'TIMELINE' | 'PROFILE' | 'HEALTH' | 'GUARDIANS' | 'BILLING';
type StaffDetailTab = 'INFO' | 'ASSIGNMENTS';
type AppSection = 'DAILY_OPS' | 'STUDENTS' | 'ENROLLMENT' | 'TEAM' | 'COMMUNICATIONS' | 'CLASSROOM_SETTINGS' | 'CRM_DASHBOARD' | 'STAFF_SCHEDULE';

const LoginScreen: React.FC<{ onLogin: (role: UserRole, userEmail: string) => void }> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { 
      setIsLoading(false); 
      onLogin(role, email || (role === UserRole.ADMIN ? 'admin@nestflow.app' : 'teacher@nestflow.app')); 
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center relative overflow-hidden p-6">
      <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[32px] shadow-2xl w-full max-w-md z-10 border border-white relative">
         <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-300 to-primary-50 rounded-blob mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">N</div>
            <h1 className="font-display text-4xl font-bold text-gray-800 mb-2 tracking-tight">NestFlow</h1>
            <p className="text-gray-500 font-medium tracking-tight">Center Management Platform</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex bg-gray-100 rounded-2xl p-1.5 border border-gray-200">
               <button type="button" onClick={() => { setRole(UserRole.ADMIN); setEmail('manager@nestflow.app'); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${role === UserRole.ADMIN ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>Management</button>
               <button type="button" onClick={() => { setRole(UserRole.TEACHER); setEmail('frizzle@sunnyvale.edu'); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${role === UserRole.TEACHER ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>Teacher</button>
            </div>
            <div className="space-y-4">
              <input type="email" placeholder="Work Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl outline-none transition-all font-medium text-gray-700" required />
              <input type="password" placeholder="Password" defaultValue="password123" className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl outline-none transition-all font-medium text-gray-700" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-5 bg-primary-400 hover:bg-primary-500 text-white font-display font-bold text-lg rounded-2xl transition-all shadow-xl shadow-primary-200">
              {isLoading ? 'Connecting...' : 'Sign In'}
            </button>
         </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ role: UserRole, email: string } | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [activeSection, setActiveSection] = useState<AppSection>('DAILY_OPS');
  
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [shifts, setShifts] = useState<ShiftAssignment[]>(INITIAL_SHIFTS);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [guardiansMap] = useState<Record<string, Guardian[]>>(INITIAL_GUARDIANS);
  const [healthMap] = useState<Record<string, HealthProfile>>(INITIAL_HEALTH_PROFILES);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [activeChildTab, setActiveChildTab] = useState<ChildDetailTab>('TIMELINE');
  const [activeStaffTab, setActiveStaffTab] = useState<StaffDetailTab>('INFO');
  const [enrollmentTab, setEnrollmentTab] = useState<'PENDING' | 'WAITLIST'>('PENDING');
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editStaffData, setEditStaffData] = useState<Partial<StaffMember>>({});

  const teacherProfile = useMemo(() => staff.find(s => s.email === currentUser?.email), [staff, currentUser]);
  const accessibleClassrooms = useMemo(() => 
    currentUser?.role === UserRole.ADMIN ? classrooms : classrooms.filter(c => teacherProfile?.assignedClassroomIds.includes(c.id)),
    [currentUser, classrooms, teacherProfile]
  );

  const selectedChild = useMemo(() => children.find(c => c.id === selectedChildId), [children, selectedChildId]);
  const selectedStaff = useMemo(() => staff.find(s => s.id === selectedStaffId), [staff, selectedStaffId]);

  useEffect(() => {
    if (accessibleClassrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(accessibleClassrooms[0].id);
    }
  }, [accessibleClassrooms, selectedClassroomId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleShift = (staffId: string, day: string) => {
    const existing = shifts.find(s => s.staffId === staffId && s.day === day);
    const types: ShiftType[] = ['OPEN', 'MID', 'CLOSE', 'OFF'];
    let nextType: ShiftType = 'OPEN';
    
    if (existing) {
      const idx = types.indexOf(existing.type);
      nextType = types[(idx + 1) % types.length];
    }

    setShifts(prev => {
      const filtered = prev.filter(s => !(s.staffId === staffId && s.day === day));
      if (nextType === 'OFF') return filtered;
      return [...filtered, { staffId, day, type: nextType }];
    });
  };

  const handleUpdateStaff = () => {
    if (!selectedStaffId) return;
    setStaff(prev => prev.map(s => s.id === selectedStaffId ? { ...s, ...editStaffData } : s));
    setIsEditingStaff(false);
    showToast('Staff profile updated successfully!');
  };

  const centerHealth = useMemo(() => {
    const totalEnrolled = children.filter(c => c.enrollmentStatus === 'ENROLLED').length;
    const totalCapacity = classrooms.reduce((acc, c) => acc + c.capacity, 0);
    const occupancyRate = Math.round((totalEnrolled / totalCapacity) * 100);
    const arTotal = 4250; // Mock AR
    const ratios = classrooms.map(c => {
      const childrenCount = children.filter(ch => ch.classroomId === c.id && ch.status === 'PRESENT').length;
      const staffCount = staff.filter(s => s.assignedClassroomIds.includes(c.id)).length;
      return { 
        name: c.name, 
        ratio: staffCount > 0 ? `${childrenCount}:${staffCount}` : 'N/A',
        compliant: staffCount > 0 && (childrenCount / staffCount) <= 10 // Mock 1:10 rule
      };
    });

    return { totalEnrolled, totalCapacity, occupancyRate, arTotal, ratios };
  }, [children, classrooms, staff]);

  const SidebarContent = () => (
    <div className="space-y-6">
      {currentUser?.role === UserRole.ADMIN && (
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Management Suite</h3>
          <button 
            onClick={() => { setActiveSection('CRM_DASHBOARD'); setSelectedChildId(null); setSelectedStaffId(null); }} 
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'CRM_DASHBOARD' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            📊 Center Health & CRM
          </button>
          <button 
            onClick={() => { setActiveSection('STAFF_SCHEDULE'); setSelectedChildId(null); setSelectedStaffId(null); }} 
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'STAFF_SCHEDULE' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            🗓️ Staff Schedule
          </button>
          <button onClick={() => setActiveSection('CLASSROOM_SETTINGS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'CLASSROOM_SETTINGS' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>⚙️ Classroom Settings</button>
          <button onClick={() => setActiveSection('COMMUNICATIONS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'COMMUNICATIONS' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>💬 Messaging Log</button>
        </div>
      )}
      <div className="space-y-1">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Operations</h3>
          <button onClick={() => setActiveSection('DAILY_OPS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'DAILY_OPS' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>🏠 Daily Feed</button>
          <button onClick={() => { setActiveSection('STUDENTS'); setSelectedChildId(null); setSelectedStaffId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'STUDENTS' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>👶 Students</button>
          {currentUser?.role === UserRole.ADMIN && (
            <button onClick={() => setActiveSection('ENROLLMENT')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'ENROLLMENT' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>📥 Admissions</span>
              <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[10px]">{children.filter(c => c.enrollmentStatus === 'PENDING').length}</span>
            </button>
          )}
          <button onClick={() => { setActiveSection('TEAM'); setSelectedChildId(null); setSelectedStaffId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'TEAM' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>👥 Staff</button>
      </div>
    </div>
  );

  const ListPanelContent = () => {
    if (activeSection === 'STAFF_SCHEDULE') {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-display font-bold text-gray-800">Weekly Staffing</h2>
             <div className="flex gap-2 text-[10px] font-bold">
               <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full"></div> OPEN</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-400 rounded-full"></div> MID</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-400 rounded-full"></div> CLOSE</span>
             </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50/50">
                   <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Staff</th>
                   {DAYS.map(day => (
                     <th key={day} className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-b border-gray-100">{day}</th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {staff.map(s => (
                   <tr key={s.id} className="hover:bg-gray-50/30 transition-colors group">
                     <td className="p-4 border-b border-gray-50">
                       <div className="flex items-center gap-3">
                         <img src={s.avatarUrl} className="w-8 h-8 rounded-full border border-white shadow-sm" />
                         <span className="text-xs font-bold text-gray-700">{s.name.split(' ')[1] || s.name}</span>
                       </div>
                     </td>
                     {DAYS.map(day => {
                       const assignment = shifts.find(sh => sh.staffId === s.id && sh.day === day);
                       const typeColor = 
                         assignment?.type === 'OPEN' ? 'bg-green-100 text-green-700 border-green-200' :
                         assignment?.type === 'MID' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                         assignment?.type === 'CLOSE' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                         'bg-gray-50 text-gray-300 border-transparent';
                       
                       return (
                         <td key={day} className="p-2 border-b border-gray-50 text-center">
                           <button 
                             onClick={() => handleToggleShift(s.id, day)}
                             className={`w-full py-2 rounded-xl text-[9px] font-bold border transition-all active:scale-90 ${typeColor}`}
                           >
                             {assignment?.type || 'OFF'}
                           </button>
                         </td>
                       );
                     })}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

           <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-3">
             <span className="text-lg">💡</span>
             <p className="text-[11px] text-primary-700 leading-relaxed">
               Click any shift cell to cycle through <b>Open</b> (7am-3pm), <b>Mid</b> (9am-5pm), and <b>Close</b> (11am-7pm) assignments.
             </p>
           </div>
        </div>
      );
    }

    if (activeSection === 'CRM_DASHBOARD') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-end">
             <div>
               <h2 className="text-2xl font-display font-bold text-gray-800">Center CRM</h2>
               <p className="text-sm text-gray-400 font-medium">Tracking growth and engagement</p>
             </div>
             <button className="px-4 py-2 bg-primary-400 text-white text-xs font-bold rounded-full shadow-lg shadow-primary-100">Add New Lead</button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Sales Pipeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Inquiry', 'Tour Scheduled', 'Waitlist'].map(status => {
                  const items = leads.filter(l => l.status === status);
                  return (
                    <div key={status} className="bg-white/50 border border-gray-100 rounded-3xl p-4 min-h-[150px]">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{status}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{items.length}</span>
                      </div>
                      <div className="space-y-3">
                        {items.map(lead => (
                          <div key={lead.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-primary-500 transition-colors">{lead.childName}</p>
                            <p className="text-[10px] text-gray-400">{lead.parentName} • {lead.source}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'STUDENTS') {
      const teacherClassroomIds = teacherProfile?.assignedClassroomIds || [];
      const visibleStudents = children.filter(c => 
        c.enrollmentStatus === 'ENROLLED' && 
        (currentUser?.role === UserRole.ADMIN || teacherClassroomIds.includes(c.classroomId))
      );

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-display font-bold text-gray-800">Student Roster</h2>
            <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-xs font-bold">{visibleStudents.length} Active</span>
          </div>
          <div className="grid gap-4">
            {visibleStudents.map(child => (
              <NestCard key={child.id} child={child} selected={selectedChildId === child.id} onClick={() => { setSelectedChildId(child.id); setSelectedStaffId(null); setActiveChildTab('HEALTH'); }} />
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === 'TEAM') {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-gray-800">Staff Directory</h2>
          <div className="grid gap-4">
            {staff.map(s => (
              <div 
                key={s.id} 
                onClick={() => { setSelectedStaffId(s.id); setSelectedChildId(null); setIsEditingStaff(false); }}
                className={`flex items-center gap-4 p-4 bg-white rounded-nest border transition-all cursor-pointer hover:shadow-md ${selectedStaffId === s.id ? 'ring-2 ring-primary-300 border-transparent shadow-md' : 'border-gray-100'}`}
              >
                <img src={s.avatarUrl} className="w-12 h-12 rounded-blob bg-primary-50" />
                <div>
                  <h4 className="font-bold text-gray-800">{s.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default Daily Ops
    return (
      <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Room Leaders</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
               {staff.filter(s => s.assignedClassroomIds.includes(selectedClassroomId)).map(s => (
                 <div key={s.id} onClick={() => { setSelectedStaffId(s.id); setSelectedChildId(null); setIsEditingStaff(false); }} className="flex-shrink-0 flex items-center gap-2 bg-white border border-gray-100 px-3 py-2 rounded-full cursor-pointer hover:bg-primary-50 transition-colors shadow-sm">
                   <img src={s.avatarUrl} className="w-6 h-6 rounded-full" />
                   <span className="text-xs font-bold text-gray-700">{s.name}</span>
                 </div>
               ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Enrolled Children</h3>
            {children.filter(c => c.classroomId === selectedClassroomId && c.enrollmentStatus === 'ENROLLED').map(child => (
              <NestCard key={child.id} child={child} selected={selectedChildId === child.id} onClick={() => { setSelectedChildId(child.id); setSelectedStaffId(null); }} />
            ))}
          </div>
      </div>
    );
  };

  const DetailPanelContent = () => {
    if (activeSection === 'STAFF_SCHEDULE' && !selectedStaff && !selectedChild) {
      return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-300">
           <div className="p-8 border-b border-gray-100 bg-primary-50/30">
            <h3 className="text-xl font-display font-bold text-gray-800">Coverage Analytics</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Classroom Support Map</p>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
             <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today's Support</h4>
                <div className="space-y-3">
                   {classrooms.map(room => {
                     const supportingStaff = staff.filter(s => 
                       s.assignedClassroomIds.includes(room.id) && 
                       shifts.find(sh => sh.staffId === s.id && sh.day === 'Mon') // Mocking today is Mon
                     );
                     return (
                       <div key={room.id} className="p-4 bg-surface-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                         <div>
                           <p className="text-sm font-bold text-gray-800">{room.name}</p>
                           <p className="text-[10px] text-gray-400">{supportingStaff.length} Staff On-Site</p>
                         </div>
                         <div className="flex -space-x-2">
                           {supportingStaff.map(s => (
                             <img key={s.id} src={s.avatarUrl} className="w-6 h-6 rounded-full border border-white shadow-sm" />
                           ))}
                         </div>
                       </div>
                     );
                   })}
                </div>
             </div>

             <div className="bg-gradient-to-br from-accent-300 to-pink-200 p-6 rounded-[32px] text-white shadow-lg relative overflow-hidden">
                <p className="text-[10px] font-bold text-white/60 uppercase mb-2">Total Weekly Hours</p>
                <p className="text-4xl font-display font-bold">160 hrs</p>
                <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-white/40">
                   <span>Budget Limit: 180 hrs</span>
                   <span>88% Utilized</span>
                </div>
             </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'CRM_DASHBOARD' && !selectedStaff && !selectedChild) {
      return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-300">
          <div className="p-8 border-b border-gray-100 bg-primary-50/30">
            <h3 className="text-xl font-display font-bold text-gray-800">Center Health Pulse</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time Operational Metrics</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 p-5 rounded-[32px] shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Occupancy</p>
                <p className="text-2xl font-display font-bold text-primary-500">{centerHealth.occupancyRate}%</p>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                   <div className="bg-primary-300 h-full rounded-full" style={{ width: `${centerHealth.occupancyRate}%` }}></div>
                </div>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-[32px] shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">AR Overdue</p>
                <p className="text-2xl font-display font-bold text-accent-300">${centerHealth.arTotal}</p>
                <p className="text-[8px] text-gray-400 font-bold mt-1">5 FAMILIES PENDING</p>
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Ratio Compliance</h4>
               <div className="space-y-2">
                 {centerHealth.ratios.map(room => (
                   <div key={room.name} className="flex items-center justify-between p-4 bg-surface-50 rounded-2xl border border-gray-100">
                     <div>
                       <p className="text-sm font-bold text-gray-700">{room.name}</p>
                       <p className="text-[10px] text-gray-400">Current Ratio: <span className="font-bold">{room.ratio}</span></p>
                     </div>
                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${room.compliant ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {room.compliant ? 'Compliant' : 'Warning'}
                     </span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-700 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Projected Monthly Revenue</p>
                 <p className="text-4xl font-display font-bold">$48,200</p>
                 <div className="mt-6 flex justify-between items-center text-[10px] font-bold uppercase text-white/40">
                    <span>Target: $50k</span>
                    <span className="text-primary-300">96.4% to goal</span>
                 </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedStaff) {
      return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-300">
          <div className="h-44 bg-gradient-to-br from-accent-300 to-pink-200 relative">
             <div className="absolute -bottom-10 left-8 flex items-end gap-6">
               <img src={selectedStaff.avatarUrl} className="w-28 h-28 rounded-blob border-4 border-white shadow-2xl bg-white" />
               <div className="mb-12">
                  <h2 className="text-2xl font-display font-bold text-white drop-shadow-lg">{selectedStaff.name}</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/90">{selectedStaff.role}</p>
               </div>
             </div>
          </div>
          <div className="mt-14 px-8 flex gap-2 border-b border-gray-100 overflow-x-auto no-scrollbar">
            {['INFO', 'ASSIGNMENTS'].map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveStaffTab(tab as StaffDetailTab); setIsEditingStaff(false); }} 
                className={`px-4 py-3 text-[10px] font-bold relative transition-colors ${activeStaffTab === tab ? 'text-accent-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
                {activeStaffTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-300 rounded-t-full" />}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {activeStaffTab === 'INFO' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center"><h3 className="font-display font-bold text-gray-800 text-lg">Staff Profile</h3></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-surface-50 p-4 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm">✉️</div>
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p><p className="text-sm font-bold text-gray-700">{selectedStaff.email}</p></div>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-50 p-4 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm">📞</div>
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</p><p className="text-sm font-bold text-gray-700">{selectedStaff.phone}</p></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic border-l-2 border-accent-300/30 pl-4">{selectedStaff.bio}</p>
              </div>
            )}
            {activeStaffTab === 'ASSIGNMENTS' && (
               <div className="space-y-3">
                 {classrooms.map(room => (
                   <div key={room.id} className={`flex items-center justify-between p-4 rounded-2xl border ${selectedStaff.assignedClassroomIds.includes(room.id) ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 opacity-40'}`}>
                      <p className="font-bold text-gray-700">{room.name}</p>
                      {selectedStaff.assignedClassroomIds.includes(room.id) && <span className="text-primary-500">✓</span>}
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      );
    }

    if (selectedChild) {
      const health = healthMap[selectedChild.id];
      const guardians = guardiansMap[selectedChild.id] || [];

      return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4">
          <div className="h-40 bg-primary-100 relative group overflow-hidden">
             <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                <img src={selectedChild.avatarUrl} className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-white object-cover" />
                <div className="mb-10">
                   <h2 className="text-2xl font-display font-bold text-gray-800">{selectedChild.firstName} {selectedChild.lastName}</h2>
                   <p className="text-gray-500 text-xs font-bold uppercase">{selectedChild.classroom}</p>
                </div>
             </div>
          </div>
          <div className="mt-12 px-6 flex gap-1 border-b border-gray-100 overflow-x-auto no-scrollbar">
            {[
              { id: 'TIMELINE', icon: '📜' },
              { id: 'HEALTH', icon: '🏥' },
              { id: 'GUARDIANS', icon: '🏠' },
              { id: 'PROFILE', icon: '👤' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveChildTab(tab.id as ChildDetailTab)} 
                className={`px-4 py-3 text-[10px] font-bold relative transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeChildTab === tab.id ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <span>{tab.icon}</span>
                {tab.id}
                {activeChildTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-300 rounded-t-full" />}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-8">
             {activeChildTab === 'HEALTH' && (
               <div className="space-y-8">
                 {(selectedChild.allergies?.length || 0) > 0 && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                     <span className="text-xl">⚠️</span>
                     <div>
                       <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Medical Alert: Allergies</p>
                       <p className="text-sm font-bold text-red-700">{selectedChild.allergies?.join(', ')}</p>
                     </div>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blood Type</p>
                      <p className="text-sm font-bold text-gray-700">{health?.bloodType || 'N/A'}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Contacts</h4>
                   {guardians.map(g => (
                     <div key={g.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-3">
                        <img src={g.avatarUrl} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-xs font-bold text-gray-700">{g.name}</p>
                          <p className="text-[9px] text-gray-400">{g.phone}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner animate-pulse">🌱</div>
        <h3 className="text-lg font-display font-bold text-gray-600">Operations Hub</h3>
        <p className="text-xs mt-2 max-w-[240px] leading-relaxed">Select a student, lead, or staff member to manage records, health profiles, and communications.</p>
      </div>
    );
  };

  if (!isAuthenticated) return <LoginScreen onLogin={(role, email) => { setCurrentUser({ role, email }); setIsAuthenticated(true); }} />;

  return (
    <>
      <AdminLayout
        sidebar={<SidebarContent />}
        listPanel={<ListPanelContent />}
        detailPanel={<DetailPanelContent />}
        onLogout={() => { setIsAuthenticated(false); setCurrentUser(null); setSelectedChildId(null); setSelectedStaffId(null); }}
        onGoHome={() => setActiveSection('DAILY_OPS')}
      />
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl font-bold text-white z-50 animate-in slide-in-from-bottom-8 ${toast.type === 'success' ? 'bg-gray-900/90 backdrop-blur-md' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✨' : '⚠️'} {toast.message}
        </div>
      )}
    </>
  );
};

export default App;