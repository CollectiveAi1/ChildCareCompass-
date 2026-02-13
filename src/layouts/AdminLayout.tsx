import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Logo } from '../components/Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50 font-sans">
      {/* Header */}
      <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 z-40 shadow-sm shrink-0">
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Logo size={32} className="sm:w-[42px]" />
            <div className="hidden md:block">
              <h1 className="text-base sm:text-xl font-black text-brand-teal leading-none">Child Care Compass</h1>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">Guiding your Journey</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-bold text-slate-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] sm:text-xs text-slate-500">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-red-600 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
