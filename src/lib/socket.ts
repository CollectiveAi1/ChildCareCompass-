import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Join rooms
  joinChild(childId: string) {
    this.socket?.emit('join:child', childId);
  }

  joinUser(userId: string) {
    this.socket?.emit('join:user', userId);
  }

  joinClassroom(classroomId: string) {
    this.socket?.emit('join:classroom', classroomId);
  }


  // Listen to events
  onActivityNew(callback: (activity: any) => void) {
    this.socket?.on('activity:new', callback);
  }

  onMessageNew(callback: (message: any) => void) {
    this.socket?.on('message:new', callback);
  }

  onAttendanceChanged(callback: (data: any) => void) {
    this.socket?.on('attendance:changed', callback);
  }

  // Remove listeners
  offActivityNew() {
    this.socket?.off('activity:new');
  }

  offMessageNew() {
    this.socket?.off('message:new');
  }

  offAttendanceChanged() {
    this.socket?.off('attendance:changed');
  }
}

export const socketService = new SocketService();
