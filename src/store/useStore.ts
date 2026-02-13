import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
  firstName?: string;
  lastName?: string;
  centerId?: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppStore {
  // Auth state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // UI state
  toast: Toast | null;
  sidebarOpen: boolean;
  activeSection: string;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  showToast: (message: string, type: Toast['type']) => void;
  hideToast: () => void;
  toggleSidebar: () => void;
  setActiveSection: (section: string) => void;
}

export const useStore = create<AppStore>((set) => ({
  // Initial state
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  toast: null,
  sidebarOpen: true,
  activeSection: 'DAILY_OPS',

  // Actions
  setUser: (user) => set({ user }),

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },

  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  showToast: (message, type) => set({ toast: { message, type } }),

  hideToast: () => set({ toast: null }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setActiveSection: (section) => set({ activeSection: section }),
}));
