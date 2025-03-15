import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';
import { Bullet } from './Bullet';

export class Player extends Phaser.Physics.Arcade.Sprite {
    public scene: MainScene;
    private speed: number = 200;
    private health: number = 100;
    private maxHealth: number = 100;
    private shield: number = 100;
    private maxShield: number = 100;
    private shieldRegenRate: number = 0.1;
    public bullets: Phaser.Physics.Arcade.Group;
    private bulletSpeed: number = 400;
    private lastShot: number = 0;
    private shootDelay: number = 250; // milliseconds between shots
    private keys: { [key: string]: Phaser.Input.Keyboard.Key };
    
    // Health bar graphics
    private healthBar: Phaser.GameObjects.Graphics;
    private shieldBar: Phaser.GameObjects.Graphics;
    private barWidth: number = 40;
    private barHeight: number = 4;
    private barPadding: number = 2;

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y, 'player');
        this.scene = scene;

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Create bullet group
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true,
            createCallback: (obj) => {
                const bullet = obj as Bullet;
                // Initialize physics
                scene.physics.world.enable(bullet);
                bullet.setCircle(3);
                // Ensure damage property exists
                bullet.damage = 20;
            }
        });

        // Set up input keys
        this.keys = scene.input.keyboard!.addKeys('W,A,S,D') as { [key: string]: Phaser.Input.Keyboard.Key };

        // Create health and shield bars
        this.healthBar = scene.add.graphics();
        this.shieldBar = scene.add.graphics();
        this.updateHealthBars();
    }

    update() {
        if (!this.active) return;

        // Get keyboard state
        const cursors = this.scene.input.keyboard!.createCursorKeys();

        // Movement
        let velocityX = 0;
        let velocityY = 0;

        if (this.keys.A.isDown || cursors.left.isDown) velocityX -= this.speed;
        if (this.keys.D.isDown || cursors.right.isDown) velocityX += this.speed;
        if (this.keys.W.isDown || cursors.up.isDown) velocityY -= this.speed;
        if (this.keys.S.isDown || cursors.down.isDown) velocityY += this.speed;

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            const normalizer = Math.sqrt(2) / 2;
            velocityX *= normalizer;
            velocityY *= normalizer;
        }

        this.setVelocity(velocityX, velocityY);

        // Rotate player to face mouse
        const pointer = this.scene.input.activePointer;
        this.rotation = Phaser.Math.Angle.Between(
            this.x, this.y,
            pointer.x + this.scene.cameras.main.scrollX,
            pointer.y + this.scene.cameras.main.scrollY
        );

        // Shooting
        if (pointer.isDown && this.scene.time.now > this.lastShot + this.shootDelay) {
            this.shoot();
        }

        // Shield regeneration
        if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate);
            this.updateHealthBars();
        }

        // Update health bars position
        this.updateHealthBars();
    }

    private updateHealthBars() {
        // Clear previous graphics
        this.healthBar.clear();
        this.shieldBar.clear();

        // Calculate bar positions (above the player)
        const barY = -25;
        
        // Draw shield bar (top)
        const shieldWidth = (this.shield / this.maxShield) * this.barWidth;
        this.shieldBar.lineStyle(1, 0x000000);
        this.shieldBar.fillStyle(0x00ffff);
        this.shieldBar.fillRect(this.x - this.barWidth / 2, this.y + barY, shieldWidth, this.barHeight);
        this.shieldBar.strokeRect(this.x - this.barWidth / 2, this.y + barY, this.barWidth, this.barHeight);

        // Draw health bar (bottom)
        const healthWidth = (this.health / this.maxHealth) * this.barWidth;
        this.healthBar.lineStyle(1, 0x000000);
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(this.x - this.barWidth / 2, this.y + barY + this.barHeight + this.barPadding, healthWidth, this.barHeight);
        this.healthBar.strokeRect(this.x - this.barWidth / 2, this.y + barY + this.barHeight + this.barPadding, this.barWidth, this.barHeight);
    }

    private shoot() {
        const bullet = this.bullets.get(this.x, this.y) as Bullet;
        
        if (bullet) {
            const pointer = this.scene.input.activePointer;
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                pointer.x + this.scene.cameras.main.scrollX,
                pointer.y + this.scene.cameras.main.scrollY
            );

            bullet.fire(this.x, this.y, angle);
            this.lastShot = this.scene.time.now;

            // Destroy bullet after 1 second
            this.scene.time.delayedCall(1000, () => {
                if (bullet.active) {
                    bullet.destroy();
                }
            });
        }
    }

    public takeDamage(amount: number) {
        // Damage goes to shield first
        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                amount = 0;
            } else {
                amount -= this.shield;
                this.shield = 0;
            }
        }

        // Remaining damage goes to health
        if (amount > 0) {
            this.health = Math.max(0, this.health - amount);
            if (this.health <= 0) {
                this.destroy();
            }
        }

        // Update health bars
        this.updateHealthBars();
    }

    public getHealth(): number {
        return this.health;
    }

    public getShield(): number {
        return this.shield;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public getMaxShield(): number {
        return this.maxShield;
    }

    public destroy(fromScene?: boolean): void {
        // Clean up graphics before destroying
        this.healthBar.destroy();
        this.shieldBar.destroy();
        super.destroy(fromScene);
    }
} 