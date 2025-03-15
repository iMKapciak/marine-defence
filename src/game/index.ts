import Phaser from 'phaser';
import { gameConfig } from './config';

window.onload = () => {
    new Phaser.Game(gameConfig);
}; 