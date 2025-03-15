import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from './units/BaseUnit';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    public scene: MainScene;
    private health: number;
    private maxHealth: number;
    private speed: number;
    private experienceValue: number;
    private healthBar: Phaser.GameObjects.Graphics;

    constructor(scene: MainScene, x: number, y: number, level: number) {
        super(scene, x, y, 'enemy');
        this.scene = scene;
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set enemy properties based on level
        this.maxHealth = 50 * level;
        this.health = this.maxHealth;
        this.speed = 100 + (level * 10);
        this.experienceValue = 10 * level;
        
        // Set the size for physics body
        this.setCircle(10);

        // Create health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    public takeDamage(damage: number): void {
        if (!this.active) return;
        
        console.log(`Enemy taking ${damage} damage. Current health: ${this.health}`);
        this.health = Math.max(0, this.health - damage);
        this.updateHealthBar();
        
        // Flash red when hit
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) {
                this.clearTint();
            }
        });

        if (this.health <= 0) {
            console.log('Enemy destroyed');
            this.scene.removeEnemy(this);
            this.destroy();
        }
    }

    private updateHealthBar(): void {
        if (!this.active || !this.healthBar) return;

        this.healthBar.clear();

        // Draw background (gray)
        this.healthBar.fillStyle(0x808080);
        this.healthBar.fillRect(this.x - 15, this.y - 20, 30, 5);

        // Draw health (red)
        const healthWidth = (this.health / this.maxHealth) * 30;
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(this.x - 15, this.y - 20, healthWidth, 5);
    }

    update(): void {
        if (!this.active) return;

        // Get all possible targets (player and friendly units)
        const targets: (Phaser.GameObjects.GameObject & { x: number; y: number })[] = [
            this.scene.player,
            ...this.scene.getFriendlyUnits()
        ];

        // Find the closest target
        let closestTarget = targets[0];
        let closestDistance = Phaser.Math.Distance.Between(
            this.x, this.y,
            closestTarget.x, closestTarget.y
        );

        for (let i = 1; i < targets.length; i++) {
            const target = targets[i];
            if (!target.active) continue; // Skip destroyed targets

            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                target.x, target.y
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestTarget = target;
            }
        }

        // Move towards the closest target
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            closestTarget.x, closestTarget.y
        );

        const velocityX = Math.cos(angle) * this.speed;
        const velocityY = Math.sin(angle) * this.speed;
        
        this.setVelocity(velocityX, velocityY);

        // Update health bar position
        this.updateHealthBar();
    }

    public getExperienceValue(): number {
        return this.experienceValue;
    }

    public destroy(fromScene?: boolean): void {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        super.destroy(fromScene);
    }
} 