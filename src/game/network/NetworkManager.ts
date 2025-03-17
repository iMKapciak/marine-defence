import { io, Socket } from 'socket.io-client';
import { PlayerClass, PlayerData } from '../types/PlayerData';

interface ChatMessageData {
    playerId: string;
    message: string;
}

export class NetworkManager {
    private socket: Socket;
    private gameStartCallback: (() => void) | null = null;
    private playerJoinedCallback: ((data: any) => void) | null = null;
    private playerLeftCallback: ((data: any) => void) | null = null;
    private playerUpdateCallback: ((data: any) => void) | null = null;
    private gameStateUpdateCallback: ((data: any) => void) | null = null;
    private chatMessageCallback: ((data: ChatMessageData) => void) | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor() {
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
        console.log('🌐 Attempting to connect to server:', serverUrl);
        
        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 10000
        });
        
        this.setupConnectionListeners();
        this.setupEventListeners();
    }

    private setupConnectionListeners() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to server successfully! Socket ID:', this.socket.id);
            this.reconnectAttempts = 0;
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('❌ Connection error:', error.message);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.log('🔄 Maximum reconnection attempts reached, trying polling transport...');
                this.socket.io.opts.transports = ['polling', 'websocket'];
            } else {
                console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            }
        });

        this.socket.on('disconnect', (reason) => {
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

    public testConnection(): boolean {
        return this.socket.connected;
    }

    public reconnect(): void {
        console.log('🔄 Manually attempting to reconnect...');
        this.socket.connect();
    }

    public disconnect(): void {
        this.socket.disconnect();
    }
} 