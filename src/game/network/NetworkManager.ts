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
        
        // First try to verify server is running
        fetch(`${serverUrl}/health`)
            .then(response => response.json())
            .then(data => {
                console.log('✅ Server health check passed:', data);
                this.initializeSocket(serverUrl);
            })
            .catch(error => {
                console.error('❌ Server health check failed:', error);
                this.initializeSocket(serverUrl); // Try to connect anyway
            });
    }

    private initializeSocket(serverUrl: string) {
        this.socket = io(serverUrl, {
            transports: ['polling', 'websocket'], // Start with polling, then upgrade
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 20000,
            forceNew: true,
            withCredentials: true
        });
        
        this.setupConnectionListeners();
        this.setupEventListeners();
    }

    private setupConnectionListeners() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to server successfully!');
            console.log('🔌 Socket ID:', this.socket.id);
            console.log('🚀 Transport:', this.socket.io.engine.transport.name);
            this.reconnectAttempts = 0;
        });

        this.socket.io.engine.on('upgrade', (transport) => {
            console.log('🔄 Transport upgraded to:', transport);
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('❌ Connection error:', error.message);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.log('🔄 Maximum reconnection attempts reached, trying polling transport...');
                // Force polling only
                this.socket.io.opts.transports = ['polling'];
                this.socket.connect();
            } else {
                console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Disconnected from server. Reason:', reason);
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                this.socket.connect();
            }
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

        // Add ping monitoring
        setInterval(() => {
            const start = Date.now();
            this.socket.volatile.emit('ping', () => {
                const latency = Date.now() - start;
                console.log('📡 Current latency:', latency, 'ms');
            });
        }, 5000);
    }

    setupEventListeners() {
        // Implementation of setupEventListeners method
    }

    public testConnection(): boolean {
        return this.socket?.connected || false;
    }

    public reconnect(): void {
        console.log('🔄 Manually attempting to reconnect...');
        if (this.socket) {
            this.socket.connect();
        } else {
            const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
            this.initializeSocket(serverUrl);
        }
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
} 