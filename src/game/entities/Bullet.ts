import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    private speed: number = 400;
    private damage: number = 20;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet');
    }

    fire(x: number, y: number, angle: number) {
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(x, y);
        
        const velocity = this.scene.physics.velocityFromAngle(
            Phaser.Math.RadToDeg(angle),
            this.speed
        );
        
        this.setVelocity(velocity.x, velocity.y);
    }

    update() {
        // Deactivate bullets when they go off screen
        if (this.x < 0 || this.x > this.scene.game.config.width ||
            this.y < 0 || this.y > this.scene.game.config.height) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    getDamage(): number {
        return this.damage;
    }
} 