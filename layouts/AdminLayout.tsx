import React from 'react';

interface AdminLayoutProps {
  sidebar: React.ReactNode;
  listPanel: React.ReactNode;
  detailPanel: React.ReactNode;
  onCheckIn?: () => void;
  onQuickAdd?: () => void;
  onLogout?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

/**
 * 3-Column Admin Layout with Persistent Header
 * 
 * Header: Logo, Global Nav, Search, Profile
 * Body:
 *   - Left: Navigation Sidebar (Centers/Classrooms)
 *   - Center: Operational List (Children/Staff)
 *   - Right: Context/Detail (Timeline/Actions)
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  sidebar, 
  listPanel, 
  detailPanel,
  onCheckIn,
  onQuickAdd,
  onLogout,
  onGoHome,
  onGoBack,
  canGoBack
}) => {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-surface-100 font-sans">
      
      {/* --- HEADER --- */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40 shadow-sm shrink-0">
        
        {/* Left: Logo & Nav Controls */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-gradient-to-br from-primary-300 to-primary-400 rounded-blob flex items-center justify-center text-white font-bold text-lg shadow-sm">
               N
             </div>
             <span className="text-xl font-display font-bold text-gray-800 tracking-tight">NestFlow</span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100 hidden md:flex">
             <button 
               onClick={onGoHome}
               className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-white hover:text-primary-600 hover:shadow-sm transition-all"
             >
               <span>🏠</span> Dashboard
             </button>
             <div className="w-px h-4 bg-gray-200 mx-1"></div>
             <button 
               onClick={onGoBack}
               disabled={!canGoBack}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                 canGoBack 
                   ? 'text-gray-600 hover:bg-white hover:text-primary-600 hover:shadow-sm' 
                   : 'text-gray-300 cursor-not-allowed'
               }`}
             >
               <span>⬅</span> Back
             </button>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-lg mx-8 hidden sm:block">
           <div className="relative group">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-primary-400 transition-colors">🔍</span>
             <input 
               type="text" 
               placeholder="Search children, parents, or activities..." 
               className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-primary-100 rounded-full text-sm outline-none transition-all placeholder-gray-400 font-medium"
             />
           </div>
        </div>

        {/* Right: User & Actions */}
        <div className="flex items-center gap-4">
           {/* Notifications */}
           <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-primary-500 transition-colors relative">
             🔔
             <span className="absolute top-2 right-2 w-2 h-2 bg-accent-300 rounded-full border border-white"></span>
           </button>
           
           {/* Profile */}
           <div className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                 <p className="text-sm font-bold text-gray-700 leading-tight">Ms. Frizzle</p>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lead Teacher</p>
              </div>
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Frizzle" 
                alt="User" 
                className="w-9 h-9 rounded-full border-2 border-white shadow-sm bg-primary-50" 
              />
           </div>
        </div>
      </header>

      {/* --- MAIN BODY --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Column 1: Navigation Sidebar */}
        <nav className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col z-20">
          <div className="flex-1 overflow-y-auto p-4 pt-6">
            {sidebar}
          </div>
          
          {/* Sidebar Footer / Logout */}
          <div className="p-4 border-t border-gray-50 bg-white">
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Column 2: Main List Area */}
        <main className="flex-1 min-w-[350px] flex flex-col border-r border-gray-200/60 bg-surface-50 z-10">
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <h2 className="font-display font-bold text-gray-700">Classroom 1A</h2>
            <div className="flex gap-2">
              <button 
                onClick={onCheckIn}
                className="bg-white border border-primary-300 text-primary-500 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm hover:bg-primary-50 transition-colors active:scale-95"
              >
                Check In All
              </button>
              <button 
                onClick={onQuickAdd}
                className="bg-primary-300 text-white rounded-full px-4 py-1.5 text-sm font-bold shadow-sm hover:bg-primary-400 transition-colors active:scale-95"
              >
                + Quick Add
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {listPanel}
          </div>
        </main>

        {/* Column 3: Detail / Context Panel */}
        <aside className="w-[400px] flex-shrink-0 bg-white shadow-xl shadow-gray-200/50 z-30 flex flex-col border-l border-gray-100">
          {detailPanel}
        </aside>
      </div>
    </div>
  );
};