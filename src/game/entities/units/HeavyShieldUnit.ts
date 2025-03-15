import { BaseUnit } from './BaseUnit';
import MainScene from '../../scenes/MainScene';

export class HeavyShieldUnit extends BaseUnit {
    private static readonly SHIELD_DAMAGE_REDUCTION = 0.75; // Takes 75% of normal damage to shields

    constructor(scene: MainScene, x: number, y: number) {
        super(
            scene,
            x,
            y,
            'heavyUnit', // We'll create this texture
            200, // Health
            150, // Shield
            5,   // Shield regen per second
            1000 // 1 second delay before shield regen starts
        );
    }

    public takeDamage(amount: number) {
        this.lastDamageTime = this.scene.time.now;
        
        // Reduce shield damage by 25%
        if (this.currentShield > 0) {
            amount = amount * HeavyShieldUnit.SHIELD_DAMAGE_REDUCTION;
        }
        
        this.processShieldDamage(amount);
    }
} 