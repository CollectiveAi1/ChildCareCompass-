import React, { useState, useMemo, useRef } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { NestCard } from './components/NestCard';
import { ActivityFeedItem } from './components/ActivityFeedItem';
import { Logo } from './components/Logo';
import { 
  Child, Activity, ActivityType, StaffMember, 
  UserRole, ShiftAssignment, ShiftType, Invoice,
  LessonPlan, EnrollmentStatus
} from './types';

// --- INITIAL MOCK DATA ---

const INITIAL_CHILDREN: Child[] = [
  { id: '1', firstName: 'Leo', lastName: 'Dasher', avatarUrl: 'https://picsum.photos/200/200?random=1', classroom: 'Toddlers 1A', classroomId: 'toddlers', status: 'PRESENT', enrollmentStatus: 'ENROLLED', lastActivityTime: '10m ago', allergies: ['Peanuts'], dob: '2020-05-12', notes: 'Leo loves building blocks.' },
  { id: '2', firstName: 'Maya', lastName: 'Sky', avatarUrl: 'https://picsum.photos/200/200?random=2', classroom: 'Toddlers 1A', classroomId: 'toddlers', status: 'ABSENT', enrollmentStatus: 'ENROLLED', lastActivityTime: '1h ago' },
  { id: '3', firstName: 'Felix', lastName: 'Roar', avatarUrl: 'https://picsum.photos/200/200?random=3', classroom: 'Infants', classroomId: 'infants', status: 'ABSENT', enrollmentStatus: 'WAITLIST', dob: '2023-01-15' },
  { id: '4', firstName: 'Sophie', lastName: 'Bell', avatarUrl: 'https://picsum.photos/200/200?random=4', classroom: 'Infants', classroomId: 'infants', status: 'ABSENT', enrollmentStatus: 'WAITLIST', dob: '2023-03-22' },
];

const INITIAL_STAFF: StaffMember[] = [
  { id: 's1', name: 'Ms. Frizzle', role: 'Lead Teacher', email: 'frizzle@compass.edu', phone: '555-0201', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frizzle', joinedDate: '2021-08-15', assignedClassroomIds: ['toddlers'] },
  { id: 's2', name: 'Mr. Rogers', role: 'Assistant', email: 'rogers@compass.edu', phone: '555-0202', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rogers', joinedDate: '2022-01-10', assignedClassroomIds: ['infants'] },
];

const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv1', title: 'Tuition - Nov 2024', amount: '1250.00', status: 'PAID', date: '2024-11-01' },
  { id: 'inv2', title: 'Late Pickup Fee', amount: '25.00', status: 'OVERDUE', date: '2024-11-15' },
  { id: 'inv3', title: 'Tuition - Dec 2024', amount: '1250.00', status: 'PENDING', date: '2024-12-01' },
];

const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'act1', childId: '1', type: ActivityType.PHOTO, title: 'Creative Time', description: 'Leo built a giant tower out of blue blocks today!', mediaUrl: 'https://picsum.photos/400/300?random=10', timestamp: '10:15 AM', authorName: 'Ms. Frizzle' },
  { id: 'act2', childId: '1', type: ActivityType.MEAL, title: 'Morning Snack', description: 'Ate all of the apple slices.', timestamp: '11:00 AM', authorName: 'Ms. Frizzle' },
];

// --- APP COMPONENT ---

type AppSection = 'DAILY_OPS' | 'MESSAGES' | 'BILLING' | 'ENROLLMENT' | 'ANALYTICS' | 'TEAM' | 'INTEGRATIONS' | 'LESSON_PLANS';
type ChildDetailTab = 'TIMELINE' | 'HEALTH' | 'FORMS' | 'PROGRESS';

const LoginScreen: React.FC<{ onLogin: (role: UserRole, userEmail: string) => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role, email || (role === UserRole.ADMIN ? 'admin@compass.app' : role === UserRole.TEACHER ? 'teacher@compass.app' : 'parent@compass.app'));
  };

  return (
    <div className="min-h-screen bg-brand-teal flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-12 rounded-[64px] shadow-3xl w-full max-w-lg border border-white/50 animate-in zoom-in duration-500">
        <div className="mb-10">
          <Logo size={180} showTagline={true} />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-slate-50 rounded-3xl p-1.5 border border-slate-100">
            {(['ADMIN', 'TEACHER', 'PARENT'] as UserRole[]).map((r) => (
              <button 
                key={r}
                type="button" 
                onClick={() => setRole(r)} 
                className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all ${role === r ? 'bg-white text-brand-teal shadow-xl shadow-brand-teal/10' : 'text-slate-400'}`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <input 
            type="email" 
            placeholder="Work Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-slate-900 placeholder:text-slate-300" 
            required 
          />
          <button type="submit" className="w-full py-6 bg-brand-teal text-white font-black text-2xl rounded-[32px] shadow-2xl shadow-brand-teal/30 hover:scale-[1.02] active:scale-95 transition-all">
            Sign In
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
  
  // App State
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([
    { sender: 'Teacher', text: 'Leo had a great nap today!', time: '2:15 PM' },
    { sender: 'You', text: 'Thanks for the update!', time: '2:30 PM' },
  ]);

  // UI State
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('toddlers');
  const [activeChildTab, setActiveChildTab] = useState<ChildDetailTab>('TIMELINE');
  const [msgInput, setMsgInput] = useState('');

  // --- ACTIONS ---

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAttendanceChange = (childId: string, newStatus: 'PRESENT' | 'ABSENT' | 'CHECKED_OUT') => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, status: newStatus, lastActivityTime: 'Just now' } : c));
    const child = children.find(c => c.id === childId);
    if (child) {
      const type = newStatus === 'PRESENT' ? ActivityType.CHECK_IN : ActivityType.CHECK_OUT;
      const newAct: Activity = {
        id: `act-${Date.now()}`,
        childId,
        type,
        title: newStatus === 'PRESENT' ? 'Checked In' : 'Checked Out',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        authorName: currentUser?.email || 'Staff',
      };
      setActivities(prev => [newAct, ...prev]);
    }
  };

  const handleCheckInAll = () => {
    const roomChildren = children.filter(c => c.classroomId === selectedClassroomId && c.enrollmentStatus === 'ENROLLED');
    setChildren(prev => prev.map(c => {
      if (c.classroomId === selectedClassroomId && c.enrollmentStatus === 'ENROLLED') {
        return { ...c, status: 'PRESENT' as const, lastActivityTime: 'Just now' };
      }
      return c;
    }));
    showToast(`Checked in ${roomChildren.length} children`);
  };

  const handleEnrollChild = (childId: string) => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, enrollmentStatus: 'ENROLLED' } : c));
    showToast("Child successfully enrolled!");
  };

  const handleSendMessage = () => {
    if (!msgInput.trim()) return;
    const newMsg = { sender: 'You', text: msgInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setMsgInput('');
    showToast("Message sent to classroom team");
  };

  const handlePayInvoice = (invId: string) => {
    setInvoices(prev => prev.map(inv => inv.id === invId ? { ...inv, status: 'PAID' } : inv));
    showToast("Payment processed via Stripe");
  };

  // --- DERIVED STATE ---

  const analytics = useMemo(() => {
    const enrolled = children.filter(c => c.enrollmentStatus === 'ENROLLED');
    const present = enrolled.filter(c => c.status === 'PRESENT');
    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const pendingRevenue = invoices.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + parseFloat(i.amount), 0);
    return {
      occupancy: Math.round((enrolled.length / 40) * 100),
      attendanceRate: Math.round((present.length / enrolled.length) * 100) || 0,
      totalRevenue,
      pendingRevenue
    };
  }, [children, invoices]);

  // --- RENDERING MODULES ---

  const DetailPanelContent = () => {
    if (activeSection === 'BILLING') {
      return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-8 h-full overflow-y-auto">
          <div>
            <h3 className="text-3xl font-black text-brand-blue tracking-tight">Financials</h3>
            <p className="text-sm font-black text-brand-teal uppercase tracking-widest mt-1">Stripe & QuickBooks Sync</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-teal/5 p-6 rounded-[40px] border border-brand-teal/10 shadow-sm">
              <p className="text-[10px] font-black text-brand-teal uppercase mb-1">Mtd Revenue</p>
              <p className="text-3xl font-black text-brand-blue tracking-tighter">${analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-accent-300/10 p-6 rounded-[40px] border border-accent-300/20 shadow-sm">
              <p className="text-[10px] font-black text-accent-300 uppercase mb-1">Pending AR</p>
              <p className="text-3xl font-black text-accent-300 tracking-tighter">${analytics.pendingRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Ledger</h4>
            {invoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div>
                  <p className="text-sm font-black text-slate-800">{inv.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 mb-1">${inv.amount}</p>
                  {inv.status !== 'PAID' ? (
                    <button 
                      onClick={() => handlePayInvoice(inv.id)}
                      className="bg-brand-teal text-white text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <span className="text-[8px] font-black px-2.5 py-1 rounded-full uppercase bg-green-100 text-green-600">PAID</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === 'MESSAGES') {
      return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-8">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-brand-blue">Secure Messaging</h3>
              <p className="text-[10px] font-black text-brand-teal uppercase mt-1 tracking-widest">Direct to Classrooms</p>
            </div>
            <div className="w-10 h-10 bg-brand-teal/10 rounded-full flex items-center justify-center text-brand-teal">💬</div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] p-5 rounded-[32px] shadow-sm animate-in slide-in-from-bottom-2 ${m.sender === 'You' ? 'bg-brand-teal text-white ml-auto rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}>
                <p className="text-sm font-bold leading-relaxed">{m.text}</p>
                <p className={`text-[9px] mt-2 font-black uppercase tracking-widest ${m.sender === 'You' ? 'text-white/70' : 'text-slate-400'}`}>{m.time}</p>
              </div>
            ))}
          </div>
          <div className="p-8 border-t border-slate-100 bg-white">
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white transition-all" 
              />
              <button onClick={handleSendMessage} className="w-14 h-14 bg-brand-teal rounded-3xl flex items-center justify-center text-white text-xl shadow-xl shadow-brand-teal/20 hover:scale-105 active:scale-95 transition-all">↑</button>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'ANALYTICS') {
      return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-8 h-full overflow-y-auto">
          <h3 className="text-3xl font-black text-brand-blue tracking-tight">Insights</h3>
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Enrollment Trends</p>
               <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full border-[12px] border-brand-teal flex items-center justify-center text-xl font-black text-brand-blue">{analytics.occupancy}%</div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Occupancy Level</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">Target: 95%</p>
                  </div>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Daily Check-ins</p>
               <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                 <div className="bg-brand-yellow h-full" style={{ width: `${analytics.attendanceRate}%` }}></div>
               </div>
               <p className="mt-2 text-[10px] font-black text-brand-blue uppercase tracking-widest">{analytics.attendanceRate}% Arrival Rate Today</p>
            </div>
          </div>
        </div>
      );
    }

    if (selectedChildId) {
      const child = children.find(c => c.id === selectedChildId);
      if (!child) return null;
      const childActivities = activities.filter(a => a.childId === child.id);

      return (
        <div className="flex flex-col h-full bg-white overflow-hidden animate-in slide-in-from-right-8">
          <div className="h-48 bg-brand-teal/10 relative flex items-end p-10 gap-8">
            <img src={child.avatarUrl} className="w-28 h-28 rounded-[40px] border-4 border-white shadow-2xl bg-white object-cover" />
            <div className="mb-2">
              <h2 className="text-4xl font-black text-brand-blue tracking-tight">{child.firstName} {child.lastName}</h2>
              <div className="flex gap-2">
                <span className="text-[10px] font-black text-brand-teal bg-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">{child.classroom}</span>
                {child.enrollmentStatus === 'ENROLLED' && (
                  <select 
                    value={child.status}
                    onChange={(e) => handleAttendanceChange(child.id, e.target.value as any)}
                    className="text-[9px] font-black uppercase tracking-widest bg-brand-yellow/20 border-none rounded-full px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="CHECKED_OUT">Out</option>
                  </select>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-b border-slate-50 px-10 gap-10 bg-white z-10 overflow-x-auto no-scrollbar">
            {['TIMELINE', 'HEALTH', 'FORMS', 'PROGRESS'].map(tab => (
              <button key={tab} onClick={() => setActiveChildTab(tab as any)} className={`py-6 text-[10px] font-black tracking-widest relative whitespace-nowrap transition-all ${activeChildTab === tab ? 'text-brand-teal' : 'text-slate-300'}`}>
                {tab}
                {activeChildTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-teal rounded-t-full" />}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-10 bg-slate-50/20">
            {activeChildTab === 'TIMELINE' ? (
              <div className="space-y-4">
                {childActivities.length > 0 ? (
                  childActivities.map(act => <ActivityFeedItem key={act.id} activity={act} />)
                ) : (
                  <p className="text-center text-slate-400 text-xs font-black uppercase mt-10 tracking-widest">No activity logged today</p>
                )}
              </div>
            ) : activeChildTab === 'HEALTH' ? (
              <div className="space-y-6">
                {child.allergies && child.allergies.length > 0 && (
                  <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 shadow-sm animate-in pulse duration-1000">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Critical Allergy Alert</p>
                    <p className="text-md font-bold text-red-900 leading-snug">{child.allergies.join(', ')} - Severe reaction risk.</p>
                  </div>
                )}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Medical Profile</p>
                   <div className="space-y-4">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-xs font-black text-slate-400">Blood Type</span>
                        <span className="text-sm font-black text-brand-blue">O+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-black text-slate-400">Physician</span>
                        <span className="text-sm font-black text-brand-blue">Dr. Miller</span>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <div className="w-16 h-16 bg-brand-teal/5 rounded-full flex items-center justify-center text-3xl mb-4">📂</div>
                <p className="text-center text-slate-400 text-xs font-black uppercase tracking-widest italic">Module Under Development</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center bg-slate-50/30">
        <div className="w-36 h-36 bg-white rounded-blob flex items-center justify-center mb-10 shadow-2xl shadow-brand-teal/10">
          <Logo size={120} />
        </div>
        <h3 className="text-2xl font-black text-slate-400 font-display tracking-tight">Guiding Your Journey</h3>
        <p className="text-sm text-slate-300 mt-6 max-w-[280px] font-bold leading-relaxed uppercase tracking-widest text-[10px]">Select a profile to begin navigating care data.</p>
      </div>
    );
  };

  const ListPanelContent = () => {
    switch (activeSection) {
      case 'ENROLLMENT':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-brand-blue tracking-tight">Onboarding Queue</h2>
            {children.filter(c => c.enrollmentStatus === 'WAITLIST').map(c => (
              <div key={c.id} className="p-6 bg-white border border-slate-100 rounded-[40px] shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img src={c.avatarUrl} className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-yellow rounded-full border-2 border-white"></div>
                  </div>
                  <div><p className="text-sm font-black text-brand-blue">{c.firstName} {c.lastName}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Applied: Nov 20 • Age 2</p></div>
                </div>
                <button onClick={() => handleEnrollChild(c.id)} className="px-5 py-2.5 bg-brand-teal/10 text-brand-teal rounded-2xl text-[10px] font-black uppercase hover:bg-brand-teal hover:text-white transition-all shadow-sm">Enroll Family</button>
              </div>
            ))}
            {children.filter(c => c.enrollmentStatus === 'WAITLIST').length === 0 && <p className="text-center text-slate-400 text-sm font-bold uppercase">Queue is empty</p>}
          </div>
        );
      case 'TEAM':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-brand-blue tracking-tight">Our Compass Team</h2>
            {staff.map(s => (
              <div key={s.id} className="p-6 bg-white border border-slate-100 rounded-[40px] shadow-sm flex items-center justify-between group cursor-pointer hover:border-brand-teal transition-all">
                <div className="flex items-center gap-5">
                  <img src={s.avatarUrl} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-sm font-black text-brand-blue">{s.name}</p>
                    <p className="text-[10px] text-brand-teal font-bold uppercase tracking-widest">{s.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clocked In</p>
                  <p className="text-[10px] font-black text-green-500">8:02 AM</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'INTEGRATIONS':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-brand-blue tracking-tight">Compass Connect</h2>
            {[
              { name: 'Stripe Payments', status: 'Live', icon: '💳', desc: 'Auto-tuition processing' },
              { name: 'QuickBooks Sync', status: 'Synced', icon: '📈', desc: 'Real-time ledger sync' },
              { name: 'Google Calendar', status: 'Pending', icon: '📅', desc: 'Curriculum scheduling' },
              { name: 'BrightWheel LMS', status: 'Live', icon: '🎓', desc: 'Assessments import' },
            ].map(int => (
              <div key={int.name} className="p-6 bg-white border border-slate-100 rounded-[40px] shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-5">
                  <span className="text-3xl">{int.icon}</span>
                  <div>
                    <p className="text-sm font-black text-brand-blue">{int.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{int.desc}</p>
                  </div>
                </div>
                <button className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${int.status === 'Live' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>{int.status}</button>
              </div>
            ))}
          </div>
        );
      default:
        const listChildren = children.filter(c => c.classroomId === selectedClassroomId && c.enrollmentStatus === 'ENROLLED');
        return (
          <div className="space-y-5">
            <div className="flex justify-between items-center pl-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Classroom Feed</h3>
              <span className="text-[10px] font-black text-brand-teal bg-brand-teal/5 px-2 py-0.5 rounded-full">{listChildren.filter(c => c.status === 'PRESENT').length} Present</span>
            </div>
            {listChildren.map(c => (
              <NestCard key={c.id} child={c} selected={selectedChildId === c.id} onClick={() => setSelectedChildId(c.id)} />
            ))}
          </div>
        );
    }
  };

  const SidebarContent = () => (
    <div className="space-y-12">
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 pl-4">Care Portal</h3>
        {[
          { id: 'DAILY_OPS', label: 'Home Hub', icon: '🧭' },
          { id: 'MESSAGES', label: 'Messages', icon: '💬' },
          { id: 'BILLING', label: 'Billing', icon: '💰' },
        ].map(item => (
          <button key={item.id} onClick={() => { setActiveSection(item.id as AppSection); setSelectedChildId(null); }} className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeSection === item.id ? 'bg-brand-teal text-white shadow-xl shadow-brand-teal/20' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span className="mr-4 opacity-70">{item.icon}</span> {item.label}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 pl-4">Management</h3>
        {[
          { id: 'ENROLLMENT', label: 'Enrollment', icon: '📝' },
          { id: 'ANALYTICS', label: 'Insights', icon: '📊' },
          { id: 'TEAM', label: 'Staffing', icon: '👥' },
          { id: 'INTEGRATIONS', label: 'Connect', icon: '🔗' },
        ].map(item => (
          <button key={item.id} onClick={() => { setActiveSection(item.id as AppSection); setSelectedChildId(null); }} className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeSection === item.id ? 'bg-brand-teal text-white shadow-xl shadow-brand-teal/20' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span className="mr-4 opacity-70">{item.icon}</span> {item.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (!isAuthenticated) return <LoginScreen onLogin={(role, email) => { setCurrentUser({ role, email }); setIsAuthenticated(true); }} />;

  return (
    <>
      <AdminLayout
        sidebar={<SidebarContent />}
        listPanel={<ListPanelContent />}
        detailPanel={<DetailPanelContent />}
        onLogout={() => { setIsAuthenticated(false); setCurrentUser(null); setActiveSection('DAILY_OPS'); }}
        onGoHome={() => { setActiveSection('DAILY_OPS'); setSelectedChildId(null); }}
        onCheckIn={handleCheckInAll}
        onQuickAdd={() => showToast("Quick Log coming soon!", "error")}
      />
      {toast && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-12 py-5 rounded-[32px] shadow-3xl font-black text-white z-[200] animate-in slide-in-from-bottom-12 ${toast.type === 'success' ? 'bg-brand-blue/95 backdrop-blur-md' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default App;
