import Phaser from 'phaser';

export interface ShieldConfig {
    maxShields: number;
    regenRate: number;
    regenDelay: number;
    damageReduction?: number;
}

export class Shield {
    private currentShields: number;
    private maxShields: number;
    private regenRate: number;
    private regenDelay: number;
    private damageReduction: number;
    private lastDamageTime: number = 0;
    private scene: Phaser.Scene;
    private shieldBar: Phaser.GameObjects.Graphics;
    private owner: Phaser.GameObjects.Sprite;
    private currentBoost: number = 0;

    constructor(scene: Phaser.Scene, owner: Phaser.GameObjects.Sprite, config: ShieldConfig) {
        this.scene = scene;
        this.owner = owner;
        this.maxShields = config.maxShields;
        this.currentShields = config.maxShields;
        this.regenRate = config.regenRate;
        this.regenDelay = config.regenDelay;
        this.damageReduction = config.damageReduction || 1;

        // Create shield bar
        this.shieldBar = scene.add.graphics();
        this.updateShieldBar();
    }

    public takeDamage(damage: number): number {
        // Calculate reduced damage if applicable
        const actualDamage = damage * this.damageReduction;
        
        // Update last damage time
        this.lastDamageTime = this.scene.time.now;

        // If shields are depleted, return remaining damage
        if (this.currentShields <= 0) {
            return actualDamage;
        }

        // Calculate how much damage shields can absorb
        const absorbedDamage = Math.min(this.currentShields, actualDamage);
        this.currentShields -= absorbedDamage;

        // Visual feedback
        if (this.currentShields > 0) {
            this.owner.setTint(0x00ffff); // Cyan tint for shield hit
            this.scene.time.delayedCall(100, () => {
                if (this.owner.active) {
                    this.owner.clearTint();
                }
            });
        }

        this.updateShieldBar();

        // Return remaining damage
        return Math.max(0, actualDamage - absorbedDamage);
    }

    public update(time: number): void {
        // Check if enough time has passed since last damage
        if (time > this.lastDamageTime + this.regenDelay) {
            // Regenerate shields with boost
            const totalRegenRate = this.regenRate + this.currentBoost;
            this.currentShields = Math.min(
                this.maxShields,
                this.currentShields + (totalRegenRate / 60) // Convert per-second rate to per-frame
            );
            this.updateShieldBar();
        }
    }

    private updateShieldBar(): void {
        this.shieldBar.clear();

        // Only show shield bar if shields are not full
        if (this.currentShields < this.maxShields) {
            // Draw background (dark blue)
            this.shieldBar.fillStyle(0x000066);
            this.shieldBar.fillRect(this.owner.x - 15, this.owner.y - 25, 30, 3);

            // Draw shield amount (cyan)
            const shieldWidth = (this.currentShields / this.maxShields) * 30;
            this.shieldBar.fillStyle(0x00ffff);
            this.shieldBar.fillRect(this.owner.x - 15, this.owner.y - 25, shieldWidth, 3);
        }
    }

    public getCurrentShields(): number {
        return this.currentShields;
    }

    public getMaxShields(): number {
        return this.maxShields;
    }

    public destroy(): void {
        if (this.shieldBar) {
            this.shieldBar.destroy();
        }
    }

    public boost(amount: number): void {
        this.currentBoost = amount;
    }
} 