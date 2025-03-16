import Phaser from 'phaser';
import MainScene from '../../scenes/MainScene';
import { BaseUnit } from './BaseUnit';
import { ShieldConfig } from '../Shield';
import { Shotgun } from '../../weapons/Shotgun';

export class HeavyShieldUnit extends BaseUnit {
    constructor(scene: MainScene, x: number, y: number) {
        const shieldConfig: ShieldConfig = {
            maxShields: 150,
            regenRate: 5, // 5 per second
            regenDelay: 3000, // 3 second delay before regen starts
            damageReduction: 0.75 // Takes 25% less damage to shields
        };

        super(scene, x, y, 'heavyUnit', 200, shieldConfig);
        
        // Slower movement speed
        this.speed = 80; // Slower due to heavy armor
    }

    protected initWeapon(): void {
        this.weapon = new Shotgun(this.scene, this);
    }

    update(time: number): void {
        super.update(time);
        
        // Heavy units move slower but are more durable
        // Add any special behavior here
    }
} 