import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    public damage: number;
    private speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet');
        
        // Set default values
        this.damage = 20;
        this.speed = 400;
        
        // Initialize the bullet
        this.setActive(false);
        this.setVisible(false);
        
        // Set up physics body
        scene.physics.world.enable(this);
        this.setCircle(3);
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
        return this;
    }

    getDamage(): number {
        return this.damage;
    }

    update() {
        if (!this.active) return;

        // Deactivate bullets when they go off screen
        const width = Number(this.scene.game.config.width);
        const height = Number(this.scene.game.config.height);
        
        if (this.x < 0 || this.x > width ||
            this.y < 0 || this.y > height) {
            this.setActive(false);
            this.setVisible(false);
            this.destroy();
        }
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        this.update();
    }
} 