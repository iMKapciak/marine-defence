import { BaseUnit } from './BaseUnit';
import MainScene from '../../scenes/MainScene';

export class SpeedyLightUnit extends BaseUnit {
    constructor(scene: MainScene, x: number, y: number) {
        super(
            scene,
            x,
            y,
            'speedyUnit', // We'll create this texture
            100, // Health
            50,  // Shield
            10,  // Shield regen per second
            2000 // 2 second delay before shield regen starts
        );

        // Faster movement speed
        this.speed = 300;
    }
} 