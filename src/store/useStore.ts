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

const safeGetItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
};

const safeRemoveItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
};

export const useStore = create<AppStore>((set) => ({
  // Initial state
  user: null,
  token: safeGetItem('token'),
  isAuthenticated: !!safeGetItem('token'),
  toast: null,
  sidebarOpen: true,
  activeSection: 'DAILY_OPS',

  // Actions
  setUser: (user) => set({ user }),

  setToken: (token) => {
    if (token) {
      safeSetItem('token', token);
    } else {
      safeRemoveItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },

  login: (user, token) => {
    safeSetItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    safeRemoveItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  showToast: (message, type) => set({ toast: { message, type } }),

  hideToast: () => set({ toast: null }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setActiveSection: (section) => set({ activeSection: section }),
}));
