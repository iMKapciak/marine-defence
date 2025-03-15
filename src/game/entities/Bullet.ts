import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    public damage: number;
    private speed: number;
    private scene: MainScene;

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y, 'bullet');
        this.scene = scene;
        
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

        // Get world bounds from physics
        const bounds = this.scene.physics.world.bounds;
        
        // Deactivate bullets when they go outside world bounds
        if (this.x < bounds.x || this.x > bounds.right ||
            this.y < bounds.y || this.y > bounds.bottom) {
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