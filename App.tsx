
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { NestCard } from './components/NestCard';
import { ActivityFeedItem } from './components/ActivityFeedItem';
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
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-12 rounded-[48px] shadow-2xl shadow-primary-100 w-full max-w-md border border-gray-50">
        <div className="mb-12">
          <div className="w-20 h-20 bg-primary-200 rounded-blob mx-auto flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-xl shadow-primary-100">N</div>
          <h1 className="text-5xl font-bold text-slate-800 tracking-tight mb-2">NestFlow</h1>
          <p className="text-slate-400 font-medium">Childcare, simplified.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
            {(['ADMIN', 'TEACHER', 'PARENT'] as UserRole[]).map((r) => (
              <button 
                key={r}
                type="button" 
                onClick={() => setRole(r)} 
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${role === r ? 'bg-white text-primary-500 shadow-md shadow-primary-50' : 'text-slate-400'}`}
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
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-primary-50 transition-all font-semibold text-slate-900 placeholder:text-slate-300" 
              required 
            />
          </div>
          <button type="submit" className="w-full py-5 bg-primary-300 text-white font-black text-xl rounded-3xl shadow-xl shadow-primary-100 hover:scale-[1.02] active:scale-95 transition-all">
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
  // Fix: Add selectedClassroomId state variable to resolve "Cannot find name 'selectedClassroomId'" in ListPanelContent
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
            <h3 className="text-3xl font-black text-slate-800">Financials</h3>
            <p className="text-sm font-bold text-primary-400 uppercase tracking-widest mt-1">Stripe & QuickBooks Sync</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-50 p-6 rounded-[32px] border border-primary-100">
              <p className="text-[10px] font-black text-primary-400 uppercase mb-1">Mtd Revenue</p>
              <p className="text-3xl font-black text-primary-600">$12,450</p>
            </div>
            <div className="bg-accent-300/10 p-6 rounded-[32px] border border-accent-300/20">
              <p className="text-[10px] font-black text-accent-300 uppercase mb-1">Pending AR</p>
              <p className="text-3xl font-black text-accent-300">$3,200</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Ledger</h4>
            {invoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-700">{inv.title}</p>
                  <p className="text-[10px] text-slate-400">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">${inv.amount}</p>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${inv.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{inv.status}</span>
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
            <p className="text-[10px] font-bold text-primary-400 uppercase mt-1">Direct to Classrooms</p>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] p-4 rounded-3xl shadow-sm ${m.sender === 'You' ? 'bg-primary-300 text-white ml-auto rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}>
                <p className="text-xs font-medium">{m.text}</p>
                <p className={`text-[8px] mt-1 opacity-60 ${m.sender === 'You' ? 'text-white' : 'text-slate-400'}`}>{m.time}</p>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex gap-2">
              <input type="text" placeholder="Type your message..." className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 placeholder:text-slate-300" />
              <button className="w-12 h-12 bg-primary-300 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary-50">↑</button>
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
          <div className="h-44 bg-primary-100 relative flex items-end p-8 gap-6">
            <img src={child.avatarUrl} className="w-24 h-24 rounded-full border-4 border-white shadow-2xl bg-white object-cover" />
            <div className="mb-2">
              <h2 className="text-3xl font-black text-slate-800">{child.firstName} {child.lastName}</h2>
              <span className="text-[10px] font-black text-primary-500 bg-white px-2 py-0.5 rounded-full uppercase tracking-tighter">{child.classroom}</span>
            </div>
          </div>
          <div className="flex border-b border-slate-50 px-8 gap-8 bg-white z-10 overflow-x-auto no-scrollbar">
            {['TIMELINE', 'HEALTH', 'FORMS', 'PROGRESS'].map(tab => (
              <button key={tab} onClick={() => setActiveChildTab(tab as any)} className={`py-5 text-[10px] font-black tracking-widest relative whitespace-nowrap ${activeChildTab === tab ? 'text-primary-400' : 'text-slate-300'}`}>
                {tab}
                {activeChildTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-300 rounded-t-full" />}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/20">
            {activeChildTab === 'HEALTH' ? (
              <div className="space-y-6">
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Critical Warning</p>
                  <p className="text-sm font-bold text-red-900 leading-snug">Severe Peanut Allergy. EpiPen located in Staff Station Blue.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Tracking</p>
                   <div className="flex justify-between items-baseline">
                     <span className="text-2xl font-black text-slate-800">38.4 in</span>
                     <span className="text-[10px] text-green-500 font-bold">+1.2 in since Oct</span>
                   </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-300 text-xs mt-12 font-bold uppercase tracking-widest italic">Streaming classroom feed...</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center bg-slate-50/30">
        <div className="w-32 h-32 bg-white rounded-blob flex items-center justify-center mb-8 text-4xl shadow-2xl shadow-primary-50 animate-pulse">🐣</div>
        <h3 className="text-2xl font-black text-slate-400 font-display">Operational Hub</h3>
        <p className="text-sm text-slate-300 mt-4 max-w-[240px] font-medium leading-relaxed">Select a profile to view attendance, progress, or financial records.</p>
      </div>
    );
  };

  const ListPanelContent = () => {
    switch (activeSection) {
      case 'ENROLLMENT':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-slate-800">Onboarding Queue</h2>
            {children.filter(c => c.enrollmentStatus === 'WAITLIST').map(c => (
              <div key={c.id} className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={c.avatarUrl} className="w-12 h-12 rounded-2xl bg-slate-100" />
                  <div><p className="text-sm font-bold text-slate-800">{c.firstName}</p><p className="text-[10px] text-slate-400">Applied Nov 20</p></div>
                </div>
                <button onClick={() => handleEnrollChild(c.id)} className="px-4 py-2 bg-primary-100 text-primary-600 rounded-2xl text-[10px] font-black uppercase hover:bg-primary-200 transition-colors">Enroll Family</button>
              </div>
            ))}
          </div>
        );
      case 'BILLING':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-slate-800">Family Billing</h2>
            {children.filter(c => c.enrollmentStatus === 'ENROLLED').map(c => (
               <div key={c.id} className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-800">{c.firstName}'s Family</p>
                  <span className="text-[10px] font-black text-green-500">Auto-Pay Active</span>
               </div>
            ))}
          </div>
        );
      case 'ANALYTICS':
        return (
          <div className="space-y-8 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-slate-800">Center Analytics</h2>
            <div className="space-y-4">
               <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Occupancy Trend</p>
                  <div className="h-32 bg-slate-50 rounded-2xl flex items-end gap-1 p-2">
                    {[40, 60, 55, 80, 95, 90, 85].map((h, i) => <div key={i} className="flex-1 bg-primary-200 rounded-t-lg transition-all hover:bg-primary-300" style={{height: `${h}%`}} />)}
                  </div>
               </div>
            </div>
          </div>
        );
      case 'INTEGRATIONS':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-8">
            <h2 className="text-2xl font-black text-slate-800">Connected Services</h2>
            {[
              { name: 'Stripe', status: 'Connected', icon: '💳' },
              { name: 'QuickBooks', status: 'Connected', icon: '📈' },
              { name: 'Google Calendar', status: 'Syncing', icon: '📅' },
            ].map(int => (
              <div key={int.name} className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{int.icon}</span>
                  <p className="text-sm font-bold text-slate-800">{int.name}</p>
                </div>
                <span className="text-[10px] font-black text-primary-400 uppercase">{int.status}</span>
              </div>
            ))}
          </div>
        );
      default:
        const listChildren = children.filter(c => c.classroomId === selectedClassroomId && c.enrollmentStatus === 'ENROLLED');
        return (
          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Live Room Feed</h3>
            {listChildren.map(c => (
              <NestCard key={c.id} child={c} selected={selectedChildId === c.id} onClick={() => setSelectedChildId(c.id)} />
            ))}
          </div>
        );
    }
  };

  const SidebarContent = () => (
    <div className="space-y-10">
      <div className="space-y-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pl-3">Portal</h3>
        {[
          { id: 'DAILY_OPS', label: 'Live Hub', icon: '🏠' },
          { id: 'MESSAGES', label: 'Messages', icon: '💬' },
          { id: 'BILLING', label: 'Billing', icon: '💰' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id as AppSection)} className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${activeSection === item.id ? 'bg-primary-50 text-primary-500' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span className="mr-3">{item.icon}</span> {item.label}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pl-3">Administration</h3>
        {[
          { id: 'ENROLLMENT', label: 'Enrollment', icon: '📝' },
          { id: 'ANALYTICS', label: 'Insights', icon: '📊' },
          { id: 'TEAM', label: 'Staffing', icon: '👥' },
          { id: 'INTEGRATIONS', label: 'Connect', icon: '🔗' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id as AppSection)} className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${activeSection === item.id ? 'bg-primary-50 text-primary-500' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span className="mr-3">{item.icon}</span> {item.label}
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
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-5 rounded-[24px] shadow-2xl font-black text-white z-[200] animate-in slide-in-from-bottom-12 ${toast.type === 'success' ? 'bg-slate-900/90' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default App;
