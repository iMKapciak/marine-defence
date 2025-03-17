import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { PlayerClass } from '../types/PlayerData';

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

    constructor() {
        const serverUrl = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:3001';
        console.log('Connecting to server:', serverUrl);
        
        this.socket = io(serverUrl, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true
        });
        
        // Add error handling
        this.socket.on('connect_error', (error: Error) => {
            console.error('Connection error:', error);
        });

        this.socket.on('error', (error: Error) => {
            console.error('Socket error:', error);
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Implementation of setupEventListeners method
    }
} 