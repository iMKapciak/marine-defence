import Phaser from 'phaser';
import MainScene from '../../scenes/MainScene';
import { Shield, ShieldConfig } from '../Shield';
import { Dogtag } from '../Dogtag';

export abstract class BaseUnit extends Phaser.Physics.Arcade.Sprite {
    protected health: number;
    protected maxHealth: number;
    public shield: Shield;
    protected healthBar: Phaser.GameObjects.Graphics;
    public scene: MainScene;
    protected speed: number = 200;
    protected isDead: boolean = false;

    constructor(
        scene: MainScene,
        x: number,
        y: number,
        texture: string,
        health: number,
        shieldConfig: ShieldConfig
    ) {
        super(scene, x, y, texture);
        this.scene = scene;
        
        // Set up health
        this.maxHealth = health;
        this.health = health;
        
        // Set up shield
        this.shield = new Shield(scene, this, shieldConfig);
        
        // Create health bar
        this.healthBar = scene.add.graphics();
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Update health bar
        this.updateHealthBar();
    }

    protected updateHealthBar(): void {
        this.healthBar.clear();

        // Draw background (gray)
        this.healthBar.fillStyle(0x808080);
        this.healthBar.fillRect(this.x - 15, this.y - 20, 30, 5);

        // Draw health (green)
        const healthWidth = (this.health / this.maxHealth) * 30;
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(this.x - 15, this.y - 20, healthWidth, 5);
    }

    public update(time: number): void {
        if (!this.active) return;
        
        // Update shield
        this.shield.update(time);
        
        // Update health bar position
        this.updateHealthBar();
    }

    public takeDamage(damage: number): void {
        if (this.isDead) return;

        // First, let shields absorb damage
        const remainingDamage = this.shield.takeDamage(damage);
        
        if (remainingDamage > 0) {
            // Apply remaining damage to health
            this.health = Math.max(0, this.health - remainingDamage);
            this.updateHealthBar();
            
            // Visual feedback for health damage
            this.setTint(0xff0000);
            this.scene.time.delayedCall(100, () => {
                if (this.active) {
                    this.clearTint();
                }
            });

            if (this.health <= 0) {
                this.die();
            }
        }
    }

    protected die(): void {
        if (this.isDead) return;
        this.isDead = true;

        // Spawn a dogtag at unit's position and add it to the dogtags group
        const dogtag = new Dogtag(this.scene, this.x, this.y, this);
        this.scene.addDogtag(dogtag);

        // Visual death effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.8,
            duration: 500,
            onComplete: () => {
                this.setActive(false);
                this.setVisible(false);
            }
        });
    }

    public getHealth(): number {
        return this.health;
    }

    public destroy(fromScene?: boolean): void {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        if (this.shield) {
            this.shield.destroy();
        }
        super.destroy(fromScene);
    }

    public respawn(x: number, y: number): void {
        // Reset health and shield
        this.health = this.maxHealth;
        this.shield.reset();
        
        // Reset position and visibility
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);
        this.setScale(1);
        
        // Reset death state
        this.isDead = false;
        
        // Update health bar
        this.updateHealthBar();
    }
} 