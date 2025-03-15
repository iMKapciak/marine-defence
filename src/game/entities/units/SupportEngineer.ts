import Phaser from 'phaser';
import MainScene from '../../scenes/MainScene';
import { BaseUnit } from './BaseUnit';
import { ShieldConfig } from '../Shield';

export class SupportEngineer extends BaseUnit {
    private shieldBoosterRange: number = 150;
    private shieldBoostAmount: number = 2; // Additional shield regen per second
    private lastBoostTime: number = 0;
    private boostInterval: number = 1000; // Check for units to boost every second
    private boostVisual: Phaser.GameObjects.Graphics;
    private mainScene: MainScene;

    constructor(scene: MainScene, x: number, y: number) {
        const shieldConfig: ShieldConfig = {
            maxShields: 80,
            regenRate: 6, // 6 per second
            regenDelay: 2500, // 2.5 second delay before regen starts
            damageReduction: 1 // Normal damage
        };

        super(scene, x, y, 'engineerUnit', 120, shieldConfig);
        this.mainScene = scene;

        // Create visual indicator for boost range
        this.boostVisual = scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(50);
        this.updateBoostVisual();
    }

    private updateBoostVisual(): void {
        this.boostVisual.clear();
        this.boostVisual.lineStyle(1, 0x00ffff, 0.3);
        this.boostVisual.strokeCircle(this.x, this.y, this.shieldBoosterRange);
    }

    private boostNearbyUnits(): void {
        const friendlyUnits = this.mainScene.getFriendlyUnits();
        if (!friendlyUnits || !Array.isArray(friendlyUnits)) {
            return;
        }

        const nearbyUnits = friendlyUnits.filter(unit => {
            if (!unit || !unit.active || unit === this) return false;
            
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                unit.x, unit.y
            );
            
            return distance <= this.shieldBoosterRange;
        });

        nearbyUnits.forEach(unit => {
            // Apply shield boost
            if (unit.shield) {
                unit.shield.boost(this.shieldBoostAmount);
            }
            
            // Visual feedback
            const line = this.mainScene.add.graphics();
            line.lineStyle(2, 0x00ffff, 0.5);
            line.lineBetween(this.x, this.y, unit.x, unit.y);
            
            this.mainScene.time.delayedCall(200, () => {
                line.destroy();
            });
        });
    }

    update(time: number): void {
        super.update(time);
        
        // Update boost visual position
        this.updateBoostVisual();
        
        // Check for units to boost
        if (time > this.lastBoostTime + this.boostInterval) {
            this.boostNearbyUnits();
            this.lastBoostTime = time;
        }
    }

    destroy(fromScene?: boolean): void {
        if (this.boostVisual) {
            this.boostVisual.destroy();
        }
        super.destroy(fromScene);
    }
} 