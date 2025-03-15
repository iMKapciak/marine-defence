import Phaser from 'phaser';
import MainScene from '../../scenes/MainScene';
import { BaseUnit } from './BaseUnit';
import { ShieldConfig } from '../Shield';

export class SpeedyLightUnit extends BaseUnit {
    constructor(scene: MainScene, x: number, y: number) {
        const shieldConfig: ShieldConfig = {
            maxShields: 50,
            regenRate: 10, // 10 per second
            regenDelay: 2000, // 2 second delay before regen starts
            damageReduction: 1 // Normal damage
        };

        super(scene, x, y, 'speedyUnit', 100, shieldConfig);

        // Faster movement speed
        this.speed = 300;
    }

    update(time: number): void {
        super.update(time);
        
        // Speedy units move faster but have less health/shields
        // Add any special behavior here
    }
} 