import Phaser from 'phaser';
import MainScene from '../../scenes/MainScene';
import { BaseUnit } from './BaseUnit';
import { ShieldConfig } from '../Shield';
import { AssaultRifle } from '../../weapons/AssaultRifle';

export class AssaultMarine extends BaseUnit {
    constructor(scene: MainScene, x: number, y: number) {
        const shieldConfig: ShieldConfig = {
            maxShields: 100,
            regenRate: 7, // 7 per second
            regenDelay: 2500, // 2.5 second delay before regen starts
            damageReduction: 1 // Normal damage
        };

        super(scene, x, y, 'marineUnit', 150, shieldConfig);
        
        this.maxHealth = 120;
        this.health = this.maxHealth;
        this.speed = 100; // Balanced speed
    }

    protected initWeapon(): void {
        this.weapon = new AssaultRifle(this.scene, this);
    }

    update(time: number): void {
        super.update(time);
        
        // Assault Marines are balanced units
        // Add any special behavior here
    }
} 