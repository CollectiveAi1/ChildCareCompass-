import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { NestCard } from './components/NestCard';
import { ActivityFeedItem } from './components/ActivityFeedItem';
import { Child, Activity, ActivityType, Guardian, Invoice, Classroom, EnrollmentStatus, HealthProfile, Immunization, Medication, StaffMember, UserRole } from './types';

// --- MOCK DATA ---

const CENTERS = [
  { id: 'c1', name: 'Sunny Vale Academy' },
  { id: 'c2', name: 'North Hills Campus' },
];

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
  }
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

const INITIAL_GUARDIANS: Record<string, Guardian[]> = {
  '1': [{ id: 'g1', name: 'Sarah Dasher', relation: 'Mother', phone: '555-0101', email: 'sarah@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=g1' }],
  'w1': [{ id: 'gw1', name: 'Ben Waites', relation: 'Father', phone: '555-9901', email: 'ben@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=gw1' }],
  'w2': [{ id: 'gw2', name: 'Jane Miller', relation: 'Mother', phone: '555-9902', email: 'jane@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=gw2' }],
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
type AppSection = 'DAILY_OPS' | 'ENROLLMENT' | 'TEAM' | 'COMMUNICATIONS' | 'CLASSROOM_SETTINGS';

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
  const [guardiansMap] = useState<Record<string, Guardian[]>>(INITIAL_GUARDIANS);
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

  const handleUpdateStaff = () => {
    if (!selectedStaffId) return;
    setStaff(prev => prev.map(s => s.id === selectedStaffId ? { ...s, ...editStaffData } : s));
    setIsEditingStaff(false);
    showToast('Staff profile updated successfully!');
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      {currentUser?.role === UserRole.ADMIN && (
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">System Admin</h3>
          <button onClick={() => setActiveSection('CLASSROOM_SETTINGS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'CLASSROOM_SETTINGS' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}>⚙️ Classroom Settings</button>
          <button onClick={() => setActiveSection('COMMUNICATIONS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'COMMUNICATIONS' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}>💬 Messaging Log</button>
        </div>
      )}
      <div className="space-y-1">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Operations</h3>
          <button onClick={() => setActiveSection('DAILY_OPS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'DAILY_OPS' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}>🏠 Dashboard</button>
          {currentUser?.role === UserRole.ADMIN && (
            <button onClick={() => setActiveSection('ENROLLMENT')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'ENROLLMENT' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}>
              <span>📥 Enrollment</span>
              <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[10px]">{children.filter(c => c.enrollmentStatus === 'PENDING').length}</span>
            </button>
          )}
          <button onClick={() => { setActiveSection('TEAM'); setSelectedChildId(null); setSelectedStaffId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'TEAM' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}>👥 Staff</button>
      </div>
    </div>
  );

  const ListPanelContent = () => {
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

    if (activeSection === 'COMMUNICATIONS') return (
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-gray-800">Auto-Notifications</h2>
        <div className="space-y-2">
           {notificationLogs.map(log => (
             <div key={log.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-sm font-bold text-gray-800">{log.recipient}</p>
                <p className="text-xs text-gray-500">{log.subject}</p>
             </div>
           ))}
        </div>
      </div>
    );

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

          <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
            {activeStaffTab === 'INFO' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-gray-800 text-lg">Staff Profile</h3>
                  {!isEditingStaff && currentUser?.role === UserRole.ADMIN && (
                    <button 
                      onClick={() => { setIsEditingStaff(true); setEditStaffData({ ...selectedStaff }); }} 
                      className="text-xs font-bold text-accent-300 hover:underline"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditingStaff ? (
                  <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 animate-in zoom-in-95">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase pl-1">Biography</label>
                      <textarea 
                        rows={4} 
                        value={editStaffData.bio || ''} 
                        onChange={e => setEditStaffData({ ...editStaffData, bio: e.target.value })} 
                        className="w-full p-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-300 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase pl-1">Email</label>
                        <input 
                          type="email" 
                          value={editStaffData.email || ''} 
                          onChange={e => setEditStaffData({ ...editStaffData, email: e.target.value })} 
                          className="w-full p-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-300 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase pl-1">Phone</label>
                        <input 
                          type="text" 
                          value={editStaffData.phone || ''} 
                          onChange={e => setEditStaffData({ ...editStaffData, phone: e.target.value })} 
                          className="w-full p-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-300 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button onClick={() => setIsEditingStaff(false)} className="px-4 py-2 text-sm font-bold text-gray-400">Cancel</button>
                      <button onClick={handleUpdateStaff} className="px-6 py-2 bg-accent-300 text-white rounded-xl font-bold shadow-lg shadow-pink-100 transition-transform active:scale-95">Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-surface-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm">✉️</div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                          <p className="text-sm font-bold text-gray-700">{selectedStaff.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-surface-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm">📞</div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                          <p className="text-sm font-bold text-gray-700">{selectedStaff.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-3 top-0 text-4xl text-accent-300 opacity-20">"</div>
                      <p className="text-sm text-gray-600 leading-relaxed italic pl-4 border-l-2 border-accent-300/20">
                        {selectedStaff.bio || "No biography provided for this staff member."}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       <span>Joined NestFlow</span>
                       <span className="text-gray-600">{new Date(selectedStaff.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeStaffTab === 'ASSIGNMENTS' && (
              <div className="space-y-6">
                 <h3 className="font-display font-bold text-gray-800 text-lg">Classroom Assignments</h3>
                 <div className="space-y-3">
                    {classrooms.map(room => {
                      const isAssigned = selectedStaff.assignedClassroomIds.includes(room.id);
                      return (
                        <div 
                          key={room.id} 
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isAssigned ? 'bg-primary-50 border-primary-100 ring-1 ring-primary-100' : 'bg-gray-50 border-transparent opacity-60'}`}
                        >
                           <div>
                             <p className={`font-bold ${isAssigned ? 'text-primary-700' : 'text-gray-400'}`}>{room.name}</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{room.enrolled} Enrolled</p>
                           </div>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAssigned ? 'bg-primary-300 text-white shadow-sm' : 'bg-gray-200 text-white'}`}>
                              {isAssigned ? '✓' : ''}
                           </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (selectedChild) {
      return (
        <div className="flex flex-col h-full bg-white">
          <div className="h-40 bg-primary-100 relative group overflow-hidden">
             <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                <img src={selectedChild.avatarUrl} className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-white object-cover" />
                <div className="mb-10">
                   <h2 className="text-2xl font-display font-bold text-gray-800">{selectedChild.firstName} {selectedChild.lastName}</h2>
                   <p className="text-gray-500 text-xs font-bold uppercase">{selectedChild.classroom}</p>
                </div>
             </div>
          </div>
          <div className="mt-12 px-6 flex gap-1 border-b border-gray-100">
            {['TIMELINE', 'PROFILE', 'HEALTH', 'GUARDIANS'].map(tab => (
              <button key={tab} onClick={() => setActiveChildTab(tab as ChildDetailTab)} className={`px-4 py-3 text-[10px] font-bold relative transition-colors ${activeChildTab === tab ? 'text-primary-500' : 'text-gray-400'}`}>
                {tab}
                {activeChildTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-300 rounded-t-full" />}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-8">
             {activeChildTab === 'TIMELINE' && <p className="text-center text-gray-400 text-sm mt-12">No recent events logged.</p>}
             {activeChildTab === 'PROFILE' && (
               <div className="space-y-6">
                 <div className="p-6 bg-surface-50 rounded-[24px] border border-gray-100">
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-widest">Internal Notes</h4>
                   <p className="text-sm text-gray-600 leading-relaxed">"{selectedChild.notes || 'No notes available.'}"</p>
                 </div>
               </div>
             )}
             {activeChildTab === 'GUARDIANS' && (
               <div className="space-y-4">
                  {(guardiansMap[selectedChild.id] || []).map(g => (
                    <div key={g.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <img src={g.avatarUrl} className="w-12 h-12 rounded-full border border-gray-100 shadow-sm" />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{g.name}</p>
                        <p className="text-[10px] text-primary-500 font-bold uppercase">{g.relation}</p>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner animate-pulse">🌱</div>
        <h3 className="text-lg font-display font-bold text-gray-600">Operations Panel</h3>
        <p className="text-xs mt-2 max-w-[240px] leading-relaxed">Select a classroom member or staff directory entry to view detailed records and history.</p>
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