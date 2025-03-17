import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PlayerData, PlayerClass } from '../../src/game/types/PlayerData';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Store connected players
const players = new Map<string, PlayerData>();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Handle player joining
    socket.on('player:join', (playerData: PlayerData) => {
        players.set(socket.id, playerData);
        io.emit('player:list', Array.from(players.values()));
    });

    // Handle player ready status
    socket.on('player:ready', (isReady: boolean) => {
        const player = players.get(socket.id);
        if (player) {
            player.isReady = isReady;
            io.emit('player:list', Array.from(players.values()));
        }
    });

    // Handle player class selection
    socket.on('player:class', (playerClass: PlayerClass) => {
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