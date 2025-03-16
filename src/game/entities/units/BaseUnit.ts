import Phaser from 'phaser';
import MainScene from '../../scenes/MainScene';
import { Shield, ShieldConfig } from '../Shield';
import { Dogtag } from '../Dogtag';
import { Weapon } from '../../weapons/Weapon';

export abstract class BaseUnit extends Phaser.Physics.Arcade.Sprite {
    public scene: MainScene;
    protected health: number = 100;
    protected maxHealth: number = 100;
    protected speed: number = 100;
    protected weapon!: Weapon;
    protected healthBar: Phaser.GameObjects.Graphics;
    public shield!: Shield;
    protected isDead: boolean = false;

    constructor(scene: MainScene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.scene = scene;

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Create health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    protected abstract initWeapon(): void;

    public getWeapon(): Weapon {
        return this.weapon;
    }

    public getHealth(): number {
        return this.health;
    }

    public shoot(targetX: number, targetY: number): void {
        if (this.weapon && !this.isDead) {
            this.weapon.shoot(targetX, targetY);
        }
    }

    public takeDamage(amount: number): void {
        if (this.isDead) return;

        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();

        if (this.health <= 0) {
            this.die();
        }
    }

    protected die(): void {
        this.isDead = true;
        this.setActive(false);
        this.setVisible(false);
        if (this.healthBar) {
            this.healthBar.destroy();
        }
    }

    protected updateHealthBar(): void {
        if (!this.active || !this.healthBar) return;

        this.healthBar.clear();

        // Draw background (gray)
        this.healthBar.fillStyle(0x808080);
        this.healthBar.fillRect(this.x - 15, this.y - 20, 30, 5);

        // Draw health (green)
        const healthWidth = (this.health / this.maxHealth) * 30;
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(this.x - 15, this.y - 20, healthWidth, 5);
    }

    update(time: number): void {
        if (!this.active) return;
        this.updateHealthBar();
    }

    public destroy(fromScene?: boolean): void {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        super.destroy(fromScene);
    }

    public respawn(x: number, y: number): void {
        this.isDead = false;
        this.health = this.maxHealth;
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(x, y);
        this.updateHealthBar();
    }
} 