import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import { LobbyScene } from './scenes/LobbyScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: true // Enable debug mode temporarily to see physics bodies
        }
    },
    scene: [LobbyScene, MainScene],
    backgroundColor: '#000033'
}; 