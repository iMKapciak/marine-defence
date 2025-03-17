import { io, Socket as SocketType } from 'socket.io-client';
import { PlayerClass } from '../types/PlayerData';

interface ChatMessageData {
    playerId: string;
    message: string;
}

export class NetworkManager {
    private socket: SocketType;
    private gameStartCallback: (() => void) | null = null;
    private playerJoinedCallback: ((data: any) => void) | null = null;
    private playerLeftCallback: ((data: any) => void) | null = null;
    private playerUpdateCallback: ((data: any) => void) | null = null;
    private gameStateUpdateCallback: ((data: any) => void) | null = null;
    private chatMessageCallback: ((data: ChatMessageData) => void) | null = null;

    constructor() {
        const serverUrl = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:3001';
        console.log('🌐 Attempting to connect to server:', serverUrl);
        
        this.socket = io(serverUrl, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        
        this.setupConnectionListeners();
        this.setupEventListeners();
    }

    private setupConnectionListeners() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to server successfully! Socket ID:', this.socket.id);
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('❌ Connection error:', error.message);
            console.log('🔄 Attempting to reconnect...');
        });

        this.socket.on('disconnect', (reason: string) => {
            console.log('🔌 Disconnected from server. Reason:', reason);
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
            console.log('✅ Reconnected to server after', attemptNumber, 'attempts');
        });

        this.socket.on('reconnect_error', (error: Error) => {
            console.error('❌ Reconnection error:', error.message);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Failed to reconnect to server after all attempts');
        });
    }

    setupEventListeners() {
        // Implementation of setupEventListeners method
    }

    // Test method to verify connection
    public testConnection() {
        if (this.socket.connected) {
            console.log('✅ Currently connected to server');
            return true;
        } else {
            console.log('❌ Not connected to server');
            return false;
        }
    }

    // Method to manually attempt reconnection
    public reconnect() {
        console.log('🔄 Manually attempting to reconnect...');
        this.socket.connect();
    }
} 