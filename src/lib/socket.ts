// Socket.io client configuration
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // Use environment variable for socket URL, fallback to current origin
    const url = process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    socket = io(url, {
      // Try WebSocket first, fallback to polling if not available
      transports: ['websocket', 'polling'],
      autoConnect: false,
      // Reconnection settings
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }
  return socket;
};

export const connectSocket = (userId: string, userName: string, avatar?: string): Socket => {
  const s = getSocket();

  if (!s.connected) {
    s.connect();

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
      s.emit('register', { userId, userName, avatar });
    });

    s.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    s.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return s;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
