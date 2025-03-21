import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket: Socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

socket.on('connect', () => {
    console.log('[Socket] Connected to server:', SOCKET_URL);
});

socket.on('connect_error', (error: Error) => {
    console.error('[Socket] Connection error:', error.message);
});

socket.on('disconnect', (reason: string) => {
    console.log('[Socket] Disconnected from server:', reason);
});

// Debug events
socket.on('player:levelUp', (data) => {
    console.log('[Socket] Received level up event:', data);
});

socket.on('player:attributeUpgraded', (data) => {
    console.log('[Socket] Received attribute upgrade:', data);
});

socket.on('player:upgradeError', (data) => {
    console.error('[Socket] Upgrade error:', data);
}); 