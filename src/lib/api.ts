import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    role: string;
    firstName?: string;
    lastName?: string;
  }) => api.post('/auth/register', data),
};

// Children API
export const childrenApi = {
  getAll: (classroomId?: string) =>
    api.get('/children', { params: { classroomId } }),

  getById: (id: string) => api.get(`/children/${id}`),

  create: (data: any) => api.post('/children', data),

  update: (id: string, data: any) => api.put(`/children/${id}`, data),

  delete: (id: string) => api.delete(`/children/${id}`),
};

// Activities API
export const activitiesApi = {
  getAll: (childId?: string, limit?: number) =>
    api.get('/activities', { params: { childId, limit } }),

  create: (data: any) => api.post('/activities', data),

  createBulk: (data: any) => api.post('/activities/bulk', data),
};

// Attendance API
export const attendanceApi = {
  getAll: (params?: { childId?: string; date?: string; startDate?: string; endDate?: string }) =>
    api.get('/attendance', { params }),

  checkIn: (childId: string, notes?: string) =>
    api.post('/attendance/check-in', { childId, notes }),

  checkOut: (childId: string, signatureUrl?: string, notes?: string) =>
    api.post('/attendance/check-out', { childId, signatureUrl, notes }),
};

// Messages API
export const messagesApi = {
  getAll: (conversationWith?: string) =>
    api.get('/messages', { params: { conversationWith } }),

  send: (recipientId: string, content: string, childId?: string) =>
    api.post('/messages', { recipientId, content, childId }),

  markRead: (id: string) => api.patch(`/messages/${id}/read`),
};
