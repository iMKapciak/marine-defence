import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';
import { Weapon } from '../weapons/Weapon';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    public scene: MainScene;
    private speed: number = 600; // Default speed
    private range: number = 1000; // Default range in pixels
    private distanceTraveled: number = 0;
    private startX: number = 0;
    private startY: number = 0;
    private sourceWeapon: Weapon | null = null;
    private damage: number = 0;

    constructor(scene: MainScene, x: number, y: number, texture: string) {
        super(scene, x, y, 'bullet'); // Always use 'bullet' texture
        this.scene = scene;

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set bullet properties
        this.setScale(0.5);
        
        // Set up physics body size (6x6 pixels for better collision detection)
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(6, 6);
        body.setOffset(-3, -3);
    }

    public init(damage: number, speed: number, range: number = 1000, weapon: Weapon): void {
        console.log('[Bullet] Initializing with damage:', damage);
        this.damage = damage;
        this.speed = speed;
        this.range = range;
        this.distanceTraveled = 0;
        this.startX = this.x;
        this.startY = this.y;
        this.sourceWeapon = weapon;
        
        // Verify initialization
        console.log('[Bullet] Initialized:', {
            storedDamage: this.damage,
            weaponDamage: this.sourceWeapon.getDamage(),
            speed: this.speed,
            range: this.range
        });
    }

    public fire(angle: number): void {
        // Calculate velocity based on angle
        const velocityX = Math.cos(angle) * this.speed;
        const velocityY = Math.sin(angle) * this.speed;
        this.setVelocity(velocityX, velocityY);
        
        // Set rotation to match direction
        this.setRotation(angle);
    }

    public getSourceWeapon(): Weapon | null {
        return this.sourceWeapon;
    }

    public getDamage(): number {
        // Always get the current damage from the source weapon
        if (!this.sourceWeapon) {
            console.warn('[Bullet] No source weapon found for bullet, using stored damage:', this.damage);
            return this.damage;
        }

        // Get the current weapon damage
        const weaponDamage = this.sourceWeapon.getDamage();
        const finalDamage = weaponDamage;

        console.log('[Bullet] Getting damage:', {
            storedDamage: this.damage,
            weaponDamage,
            finalDamage,
            weaponStats: this.sourceWeapon.getStats()
        });

        return finalDamage;
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        // Update distance traveled
        this.distanceTraveled = Phaser.Math.Distance.Between(
            this.startX, this.startY,
            this.x, this.y
        );

        // Check if bullet has exceeded its range
        if (this.distanceTraveled >= this.range) {
            this.setActive(false);
            this.setVisible(false);
            return;
        }

        // Check world bounds
        const bounds = this.scene.physics.world.bounds;
        if (this.x < bounds.x || this.x > bounds.right ||
            this.y < bounds.y || this.y > bounds.bottom) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
} 