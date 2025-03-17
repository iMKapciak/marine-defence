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
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins in development
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
    pingTimeout: 30000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    allowUpgrades: true,
    perMessageDeflate: false,
    maxHttpBufferSize: 1e8
});

// Store connected players
const players = new Map<string, PlayerData>();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add a root endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Marine Defense Game Server',
        version: '1.0.0',
        endpoints: ['/health', '/socket.io']
    });
});

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id, 'Transport:', socket.conn.transport.name);

    // Log transport upgrade
    socket.conn.on('upgrade', (transport) => {
        console.log('Transport upgraded to:', transport.name);
    });

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
    socket.on('disconnect', (reason) => {
        console.log('Player disconnected:', socket.id, 'Reason:', reason);
        players.delete(socket.id);
        io.emit('player:list', Array.from(players.values()));
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error for player:', socket.id, error);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 