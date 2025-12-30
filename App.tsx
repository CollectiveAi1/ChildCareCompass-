
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { NestCard } from './components/NestCard';
import { ActivityFeedItem } from './components/ActivityFeedItem';
import { Logo } from './components/Logo';
import { 
  Child, Activity, ActivityType, Guardian, Classroom, StaffMember, 
  UserRole, ShiftAssignment, ShiftType, ConsentTemplate, SignedConsentForm, 
  LessonPlan, HealthProfile, Invoice 
} from './types';

// --- DATA INITIALIZATION ---

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SHIFT_TYPES: ShiftType[] = ['OPEN', 'MID', 'CLOSE', 'OFF'];

const INITIAL_CHILDREN: Child[] = [
  { id: '1', firstName: 'Leo', lastName: 'Dasher', avatarUrl: 'https://picsum.photos/200/200?random=1', classroom: 'Toddlers 1A', classroomId: 'toddlers', status: 'PRESENT', enrollmentStatus: 'ENROLLED', lastActivityTime: '10m ago', allergies: ['Peanuts'], dob: '2020-05-12', notes: 'Leo loves building blocks.' },
  { id: '2', firstName: 'Maya', lastName: 'Sky', avatarUrl: 'https://picsum.photos/200/200?random=2', classroom: 'Toddlers 1A', classroomId: 'toddlers', status: 'ABSENT', enrollmentStatus: 'ENROLLED', lastActivityTime: '1h ago' },
  { id: '3', firstName: 'Felix', lastName: 'Roar', avatarUrl: 'https://picsum.photos/200/200?random=3', classroom: 'Infants', classroomId: 'infants', status: 'ABSENT', enrollmentStatus: 'WAITLIST', dob: '2023-01-15' },
];

const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv1', title: 'Tuition - Nov 2024', amount: '1250.00', status: 'PAID', date: '2024-11-01' },
  { id: 'inv2', title: 'Late Pickup Fee', amount: '25.00', status: 'OVERDUE', date: '2024-11-15' },
  { id: 'inv3', title: 'Tuition - Dec 2024', amount: '1250.00', status: 'PENDING', date: '2024-12-01' },
];

const INITIAL_STAFF: StaffMember[] = [
  { id: 's1', name: 'Ms. Frizzle', role: 'Lead Teacher', email: 'frizzle@sunnyvale.edu', phone: '555-0201', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frizzle', joinedDate: '2021-08-15', assignedClassroomIds: ['toddlers'] },
  { id: 's2', name: 'Mr. Rogers', role: 'Assistant', email: 'rogers@sunnyvale.edu', phone: '555-0202', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rogers', joinedDate: '2022-01-10', assignedClassroomIds: ['infants'] },
];

// --- APP COMPONENT ---

type AppSection = 'DAILY_OPS' | 'STUDENTS' | 'BILLING' | 'TEAM' | 'MESSAGES' | 'ENROLLMENT' | 'ANALYTICS' | 'LESSON_PLANS' | 'INTEGRATIONS';
type ChildDetailTab = 'TIMELINE' | 'HEALTH' | 'FORMS' | 'PROGRESS';

const LoginScreen: React.FC<{ onLogin: (role: UserRole, userEmail: string) => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role, email || (role === UserRole.ADMIN ? 'admin@nestflow.app' : role === UserRole.TEACHER ? 'teacher@nestflow.app' : 'parent@nestflow.app'));
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
          <div className="relative">
            <input 
              type="email" 
              placeholder="Work Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-slate-900 placeholder:text-slate-300" 
              required 
            />
          </div>
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
  
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('toddlers');
  const [activeChildTab, setActiveChildTab] = useState<ChildDetailTab>('TIMELINE');
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([
    { sender: 'Teacher', text: 'Leo had a great nap today!', time: '2:15 PM' },
    { sender: 'You', text: 'Thanks for the update!', time: '2:30 PM' },
  ]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEnrollChild = (childId: string) => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, enrollmentStatus: 'ENROLLED' } : c));
    showToast("Child successfully enrolled!");
  };

  const DetailPanelContent = () => {
    if (activeSection === 'BILLING') {
      return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-8">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Financials</h3>
            <p className="text-sm font-black text-brand-teal uppercase tracking-widest mt-1">Stripe & QuickBooks Sync</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-teal/5 p-6 rounded-[40px] border border-brand-teal/10">
              <p className="text-[10px] font-black text-brand-teal uppercase mb-1">Mtd Revenue</p>
              <p className="text-3xl font-black text-brand-blue tracking-tighter">$12,450</p>
            </div>
            <div className="bg-accent-300/10 p-6 rounded-[40px] border border-accent-300/20">
              <p className="text-[10px] font-black text-accent-300 uppercase mb-1">Pending AR</p>
              <p className="text-3xl font-black text-accent-300 tracking-tighter">$3,200</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Ledger</h4>
            {invoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-bold text-slate-800">{inv.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">${inv.amount}</p>
                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase ${inv.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{inv.status}</span>
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
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-2xl font-black text-slate-800">Secure Messaging</h3>
            <p className="text-[10px] font-black text-brand-teal uppercase mt-1 tracking-widest">Direct to Classrooms</p>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] p-5 rounded-[32px] shadow-sm ${m.sender === 'You' ? 'bg-brand-teal text-white ml-auto rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}>
                <p className="text-sm font-bold leading-relaxed">{m.text}</p>
                <p className={`text-[9px] mt-2 font-black uppercase tracking-widest ${m.sender === 'You' ? 'text-white/70' : 'text-slate-400'}`}>{m.time}</p>
              </div>
            ))}
          </div>
          <div className="p-8 border-t border-slate-100 bg-white">
            <div className="flex gap-3">
              <input type="text" placeholder="Type your message..." className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-800 placeholder:text-slate-300" />
              <button className="w-14 h-14 bg-brand-teal rounded-3xl flex items-center justify-center text-white text-xl shadow-xl shadow-brand-teal/20 hover:scale-105 active:scale-95 transition-all">↑</button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedChildId) {
      const child = children.find(c => c.id === selectedChildId);
      if (!child) return null;
      return (
        <div className="flex flex-col h-full bg-white overflow-hidden animate-in slide-in-from-right-8">
          <div className="h-48 bg-brand-teal/10 relative flex items-end p-10 gap-8">
            <img src={child.avatarUrl} className="w-28 h-28 rounded-[40px] border-4 border-white shadow-2xl bg-white object-cover" />
            <div className="mb-2">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">{child.firstName} {child.lastName}</h2>
              <span className="text-[10px] font-black text-brand-teal bg-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">{child.classroom}</span>
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
            {activeChildTab === 'HEALTH' ? (
              <div className="space-y-6">
                <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 shadow-sm">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Critical Health Note</p>
                  <p className="text-md font-bold text-red-900 leading-snug">Severe Peanut Allergy. EpiPen is located in Staff Blue Station (Top Shelf).</p>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Development Log</p>
                   <div className="flex justify-between items-baseline">
                     <span className="text-3xl font-black text-slate-800 tracking-tighter">38.4 in</span>
                     <span className="text-[11px] text-green-500 font-black uppercase tracking-widest">+1.2 in (Q4)</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <div className="w-16 h-16 bg-brand-teal/5 rounded-full flex items-center justify-center text-3xl mb-4">📸</div>
                <p className="text-center text-slate-400 text-xs font-black uppercase tracking-widest italic">Streaming Feed Unavailable</p>
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
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Onboarding Queue</h2>
            {children.filter(c => c.enrollmentStatus === 'WAITLIST').map(c => (
              <div key={c.id} className="p-6 bg-white border border-slate-100 rounded-[40px] shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                  <img src={c.avatarUrl} className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-white" />
                  <div><p className="text-sm font-black text-slate-800">{c.firstName}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Waitlist • Nov 20</p></div>
                </div>
                <button onClick={() => handleEnrollChild(c.id)} className="px-5 py-2.5 bg-brand-teal/10 text-brand-teal rounded-2xl text-[10px] font-black uppercase hover:bg-brand-teal hover:text-white transition-all">Enroll</button>
              </div>
            ))}
          </div>
        );
      case 'BILLING':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Family Billing</h2>
            {children.filter(c => c.enrollmentStatus === 'ENROLLED').map(c => (
               <div key={c.id} className="p-6 bg-white border border-slate-100 rounded-[40px] shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                  <p className="text-sm font-black text-slate-800">{c.firstName}'s Family</p>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">Auto-Pay Enabled</span>
               </div>
            ))}
          </div>
        );
      case 'ANALYTICS':
        return (
          <div className="space-y-8 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Center Analytics</h2>
            <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Weekly Occupancy Trend</p>
                <div className="h-40 bg-slate-50/50 rounded-[32px] flex items-end gap-1.5 p-4 border border-slate-100/50">
                  {[40, 60, 55, 80, 95, 90, 85].map((h, i) => <div key={i} className="flex-1 bg-brand-teal/20 rounded-t-[12px] transition-all hover:bg-brand-teal/40 group relative" style={{height: `${h}%`}}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-black">{h}%</div>
                  </div>)}
                </div>
            </div>
          </div>
        );
      case 'INTEGRATIONS':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Compass Connect</h2>
            {[
              { name: 'Stripe Payments', status: 'Live', icon: '💳' },
              { name: 'QuickBooks Sync', status: 'Synced', icon: '📈' },
              { name: 'Google Calendar', status: 'Syncing', icon: '📅' },
            ].map(int => (
              <div key={int.name} className="p-6 bg-white border border-slate-100 rounded-[40px] shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                  <span className="text-3xl filter grayscale hover:grayscale-0 transition-all cursor-default">{int.icon}</span>
                  <p className="text-sm font-black text-slate-800">{int.name}</p>
                </div>
                <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest bg-brand-teal/5 px-3 py-1 rounded-full">{int.status}</span>
              </div>
            ))}
          </div>
        );
      default:
        const listChildren = children.filter(c => c.classroomId === selectedClassroomId && c.enrollmentStatus === 'ENROLLED');
        return (
          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Live Classroom Feed</h3>
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
          <button key={item.id} onClick={() => setActiveSection(item.id as AppSection)} className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeSection === item.id ? 'bg-brand-teal text-white shadow-xl shadow-brand-teal/20' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span className="mr-4 opacity-70">{item.icon}</span> {item.label}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 pl-4">Management</h3>
        {[
          { id: 'ENROLLMENT', label: 'Enrollment', icon: '📝' },
          { id: 'ANALYTICS', label: 'Insights', icon: '📊' },
          { id: 'INTEGRATIONS', label: 'Integrations', icon: '🔗' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id as AppSection)} className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeSection === item.id ? 'bg-brand-teal text-white shadow-xl shadow-brand-teal/20' : 'text-slate-500 hover:bg-slate-50'}`}>
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
        onGoHome={() => setActiveSection('DAILY_OPS')}
      />
      {toast && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-12 py-5 rounded-[32px] shadow-3xl font-black text-white z-[200] animate-in slide-in-from-bottom-12 ${toast.type === 'success' ? 'bg-slate-900/95 backdrop-blur-md' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default App;
