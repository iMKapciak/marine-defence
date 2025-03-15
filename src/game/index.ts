import Phaser from 'phaser';
import { gameConfig } from './config';

window.addEventListener('load', () => {
    try {
        const game = new Phaser.Game(gameConfig);
        console.log('Game initialized successfully');
        
        // Add error handling for WebGL context loss
        game.canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.error('WebGL Context Lost');
        });
        
        game.canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL Context Restored');
        });
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
}); 