import Phaser from 'phaser';
import { Bullet } from '../entities/Bullet';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from '../entities/units/BaseUnit';

export interface WeaponStats {
    damage: number;
    speed: number;
    range: number;
    fireRate: number; // milliseconds between shots
    spread: number; // in radians
    projectiles: number; // number of bullets per shot
}

export abstract class Weapon {
    protected scene: MainScene;
    protected owner: BaseUnit;
    protected bullets: Phaser.Physics.Arcade.Group;
    protected lastShot: number = 0;
    protected stats: WeaponStats;

    constructor(scene: MainScene, owner: BaseUnit, stats: WeaponStats) {
        this.scene = scene;
        this.owner = owner;
        this.stats = stats;

        // Create bullet group
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true,
            createCallback: (obj) => {
                const bullet = obj as Bullet;
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
    }

    public shoot(targetX: number, targetY: number): void {
        const now = this.scene.time.now;
        if (now < this.lastShot + this.stats.fireRate) return;

        this.lastShot = now;
        this.fireProjectiles(targetX, targetY);
    }

    protected abstract fireProjectiles(targetX: number, targetY: number): void;

    public getBullets(): Phaser.Physics.Arcade.Group {
        return this.bullets;
    }
} 