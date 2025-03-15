import Phaser from 'phaser';
import MainScene from '../../scenes/MainScene';

export abstract class BaseUnit extends Phaser.Physics.Arcade.Sprite {
    public scene: MainScene;
    protected maxHealth: number;
    protected currentHealth: number;
    protected maxShield: number;
    protected currentShield: number;
    protected baseShieldRegenRate: number;
    protected shieldRegenBoost: number = 0;
    protected shieldRegenDelay: number = 0; // Delay before shield starts regenerating
    protected lastDamageTime: number = 0;
    protected speed: number = 200;
    
    // Health bar graphics
    protected healthBar: Phaser.GameObjects.Graphics;
    protected shieldBar: Phaser.GameObjects.Graphics;
    protected barWidth: number = 40;
    protected barHeight: number = 4;
    protected barPadding: number = 2;

    constructor(
        scene: MainScene,
        x: number,
        y: number,
        texture: string,
        maxHealth: number,
        maxShield: number,
        shieldRegenRate: number,
        shieldRegenDelay: number = 0
    ) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.maxShield = maxShield;
        this.currentShield = maxShield;
        this.baseShieldRegenRate = shieldRegenRate;
        this.shieldRegenDelay = shieldRegenDelay;

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Create health and shield bars
        this.healthBar = scene.add.graphics();
        this.shieldBar = scene.add.graphics();
        this.updateHealthBars();
    }

    update(time: number) {
        if (!this.active) return;

        // Shield regeneration
        if (time > this.lastDamageTime + this.shieldRegenDelay && this.currentShield < this.maxShield) {
            const totalRegenRate = this.baseShieldRegenRate + this.shieldRegenBoost;
            this.currentShield = Math.min(
                this.maxShield,
                this.currentShield + (totalRegenRate / 60) // Convert per-second rate to per-frame
            );
            this.updateHealthBars();
        }

        this.updateHealthBars();
    }

    protected updateHealthBars() {
        // Clear previous graphics
        this.healthBar.clear();
        this.shieldBar.clear();

        // Calculate bar positions (above the unit)
        const barY = -25;
        
        // Draw shield bar (top)
        const shieldWidth = (this.currentShield / this.maxShield) * this.barWidth;
        this.shieldBar.lineStyle(1, 0x000000);
        this.shieldBar.fillStyle(0x00ffff);
        this.shieldBar.fillRect(this.x - this.barWidth / 2, this.y + barY, shieldWidth, this.barHeight);
        this.shieldBar.strokeRect(this.x - this.barWidth / 2, this.y + barY, this.barWidth, this.barHeight);

        // Draw health bar (bottom)
        const healthWidth = (this.currentHealth / this.maxHealth) * this.barWidth;
        this.healthBar.lineStyle(1, 0x000000);
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(this.x - this.barWidth / 2, this.y + barY + this.barHeight + this.barPadding, healthWidth, this.barHeight);
        this.healthBar.strokeRect(this.x - this.barWidth / 2, this.y + barY + this.barHeight + this.barPadding, this.barWidth, this.barHeight);
    }

    public takeDamage(amount: number) {
        this.lastDamageTime = this.scene.time.now;
        
        // Override in child classes for special damage handling
        this.processShieldDamage(amount);
    }

    protected processShieldDamage(amount: number) {
        // Damage goes to shield first
        if (this.currentShield > 0) {
            if (this.currentShield >= amount) {
                this.currentShield -= amount;
                amount = 0;
            } else {
                amount -= this.currentShield;
                this.currentShield = 0;
            }
        }

        // Remaining damage goes to health
        if (amount > 0) {
            this.currentHealth = Math.max(0, this.currentHealth - amount);
            if (this.currentHealth <= 0) {
                this.destroy();
            }
        }

        this.updateHealthBars();
    }

    public getHealth(): number {
        return this.currentHealth;
    }

    public getShield(): number {
        return this.currentShield;
    }

    public boostShieldRegen(amount: number) {
        this.shieldRegenBoost += amount;
    }

    public destroy(fromScene?: boolean): void {
        this.healthBar.destroy();
        this.shieldBar.destroy();
        super.destroy(fromScene);
    }
} 