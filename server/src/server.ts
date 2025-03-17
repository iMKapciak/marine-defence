import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PlayerData, PlayerClass } from './types/PlayerData';

const app = express();
const httpServer = createServer(app);

// Configure CORS for both Express and Socket.IO
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: true
}));

const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins in development
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling'] // Enable both WebSocket and polling
});

// Store connected players
const players = new Map<string, PlayerData>();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Handle player joining
    socket.on('player:join', (playerData: PlayerData) => {
        console.log('Player joined:', playerData);
        players.set(socket.id, playerData);
        io.emit('player:list', Array.from(players.values()));
    });

    // Handle player ready status
    socket.on('player:ready', (isReady: boolean) => {
        console.log('Player ready status changed:', socket.id, isReady);
        const player = players.get(socket.id);
        if (player) {
            player.isReady = isReady;
            io.emit('player:list', Array.from(players.values()));
        }
    });

    // Handle player class selection
    socket.on('player:class', (playerClass: PlayerClass) => {
        console.log('Player class selected:', socket.id, playerClass);
        const player = players.get(socket.id);
        if (player) {
            player.class = playerClass;
            io.emit('player:list', Array.from(players.values()));
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        players.delete(socket.id);
        io.emit('player:list', Array.from(players.values()));
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 