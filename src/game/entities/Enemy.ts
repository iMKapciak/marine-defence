import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from './units/BaseUnit';
import { Dogtag } from './Dogtag';

export enum EnemyType {
    FAST = 'FAST',
    NORMAL = 'NORMAL',
    HEAVY = 'HEAVY'
}

interface EnemyStats {
    health: number;
    speed: number;
    damage: number;
    experienceValue: number;
    color: number;
    size: number;
}

const ENEMY_STATS: Record<EnemyType, EnemyStats> = {
    [EnemyType.FAST]: {
        health: 30,
        speed: 180,
        damage: 5,
        experienceValue: 5,
        color: 0xff6666,
        size: 8
    },
    [EnemyType.NORMAL]: {
        health: 50,
        speed: 100,
        damage: 10,
        experienceValue: 10,
        color: 0xff0000,
        size: 10
    },
    [EnemyType.HEAVY]: {
        health: 100,
        speed: 50,
        damage: 20,
        experienceValue: 20,
        color: 0x990000,
        size: 15
    }
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private health: number;
    private maxHealth: number;
    private speed: number;
    private experienceValue: number;
    private healthBar: Phaser.GameObjects.Graphics;
    private damage: number;
    private enemyType: EnemyType;
    public lastDamageTime: number = 0;
    public damageInterval: number = 1000; // 1 second between attacks
    public scene: MainScene;

    constructor(scene: MainScene, x: number, y: number, level: number, type: EnemyType = EnemyType.NORMAL) {
        super(scene, x, y, 'enemy');
        
        this.scene = scene;
        this.enemyType = type;
        
        // Get base stats for this enemy type
        const stats = ENEMY_STATS[type];
        
        // Scale stats based on level
        this.maxHealth = stats.health * (1 + (level - 1) * 0.5);
        this.health = this.maxHealth;
        this.speed = stats.speed * (1 + (level - 1) * 0.1);
        this.experienceValue = stats.damage * level;
        this.damage = stats.damage * (1 + (level - 1) * 0.3);

        // Create custom texture for this enemy type
        this.createEnemyTexture(stats.color, stats.size);
        
        // Create health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    private createEnemyTexture(color: number, size: number): void {
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(2, color);
        graphics.fillStyle(color);
        graphics.beginPath();
        graphics.arc(0, 0, size, 0, Math.PI * 2);
        graphics.closePath();
        graphics.fill();
        graphics.stroke();
        
        const textureName = `enemy_${this.enemyType}_${color}`;
        graphics.generateTexture(textureName, size * 2 + 4, size * 2 + 4);
        graphics.destroy();
        
        this.setTexture(textureName);
    }

    public init(): void {
        // Add to scene and enable physics
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        // Set the size for physics body based on enemy type
        const stats = ENEMY_STATS[this.enemyType];
        const size = stats.size * 2; // Double the size for better collision detection
        this.setCircle(size);
        
        // Make sure the sprite is active
        this.setActive(true);
        this.setVisible(true);
    }

    public getDamageAmount(): number {
        return this.damage;
    }

    public takeDamage(amount: number): void {
        if (!this.active) return;

        console.log('[Enemy] Taking damage:', amount);
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();

        // Show damage number
        const damageText = this.scene.add.text(this.x, this.y - 20, Math.round(amount).toString(), {
            fontSize: '16px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        });
        damageText.setOrigin(0.5);

        // Animate the damage number
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                damageText.destroy();
            }
        });

        // Flash red when hit
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });

        if (this.health <= 0) {
            // Remove from scene's enemy list and destroy
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