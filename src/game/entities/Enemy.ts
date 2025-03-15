import Phaser from 'phaser';
import { Player } from './Player';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private health: number;
    private speed: number;
    private experienceValue: number;
    private damage: number;
    private player: Player;

    constructor(scene: Phaser.Scene, x: number, y: number, wave: number) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Scale stats with wave number
        this.health = 50 + wave * 10;
        this.speed = 100 + wave * 5;
        this.experienceValue = 10 + wave * 5;
        this.damage = 10 + wave * 2;

        // Find the player reference
        this.player = (scene as any).player;

        // Set up collision detection
        scene.physics.add.overlap(
            this,
            (scene as any).player.bullets,
            this.onBulletHit,
            undefined,
            this
        );

        scene.physics.add.overlap(
            this,
            (scene as any).player,
            this.onPlayerCollision,
            undefined,
            this
        );
    }

    update() {
        if (!this.active) return;

        // Move towards player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.player.x, this.player.y
        );

        const velocity = this.scene.physics.velocityFromAngle(
            Phaser.Math.RadToDeg(angle),
            this.speed
        );

        this.setVelocity(velocity.x, velocity.y);
    }

    private onBulletHit(enemy: Enemy, bullet: Phaser.Physics.Arcade.Sprite) {
        bullet.setActive(false);
        bullet.setVisible(false);
        this.damage(20); // Bullet damage
    }

    private onPlayerCollision(enemy: Enemy, player: Player) {
        player.damage(this.damage);
    }

    public damage(amount: number) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    private die() {
        (this.scene as any).removeEnemy(this);
        this.destroy();
    }

    public getExperienceValue(): number {
        return this.experienceValue;
    }
} 