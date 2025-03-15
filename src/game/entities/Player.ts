import Phaser from 'phaser';
import { Bullet } from './Bullet';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private health: number = 100;
    private maxHealth: number = 100;
    private shield: number = 100;
    private maxShield: number = 100;
    private shieldRegenRate: number = 0.1;
    private speed: number = 200;
    private bullets: Phaser.Physics.Arcade.Group;
    private lastShot: number = 0;
    private fireRate: number = 250; // milliseconds between shots

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set up bullets group
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true
        });

        // Set up player physics
        this.setCollideWorldBounds(true);
    }

    update() {
        // Movement
        const cursors = this.scene.input.keyboard.createCursorKeys();
        const moveX = (cursors.left.isDown ? -1 : 0) + (cursors.right.isDown ? 1 : 0);
        const moveY = (cursors.up.isDown ? -1 : 0) + (cursors.down.isDown ? 1 : 0);

        this.setVelocity(moveX * this.speed, moveY * this.speed);

        // Shooting
        if (this.scene.input.activePointer.isDown) {
            this.shoot();
        }

        // Shield regeneration
        if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate);
        }
    }

    private shoot() {
        const time = this.scene.time.now;
        if (time > this.lastShot + this.fireRate) {
            const pointer = this.scene.input.activePointer;
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                pointer.x, pointer.y
            );

            const bullet = this.bullets.get(this.x, this.y) as Bullet;
            if (bullet) {
                bullet.fire(this.x, this.y, angle);
                this.lastShot = time;
            }
        }
    }

    public damage(amount: number) {
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
                this.die();
            }
        }
    }

    private die() {
        // Handle player death
        this.scene.scene.restart();
    }

    public getHealth() {
        return this.health;
    }

    public getShield() {
        return this.shield;
    }

    public getMaxHealth() {
        return this.maxHealth;
    }

    public getMaxShield() {
        return this.maxShield;
    }
} 