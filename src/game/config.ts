import Phaser from 'phaser';
import LobbyScene from './scenes/LobbyScene.ts';
import MainScene from './scenes/MainScene.ts';
import { LevelingScene } from './scenes/LevelingScene.tsx';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1600,
    height: 900,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [LobbyScene, MainScene, LevelingScene]
};

export default config; 