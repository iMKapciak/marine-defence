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
        // Create a new stats object to avoid reference issues
        this.stats = { ...stats };

        // Create bullet group
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true,
            defaultKey: 'bullet',
            createCallback: (obj) => {
                const bullet = obj as Bullet;
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });

        console.log('[Weapon] Initialized with stats:', this.stats);
    }

    public shoot(targetX: number, targetY: number): void {
        const now = this.scene.time.now;
        if (now < this.lastShot + this.stats.fireRate) {
            console.log('[Weapon] Cannot shoot yet, cooldown remaining:', this.lastShot + this.stats.fireRate - now);
            return;
        }

        console.log('[Weapon] Shooting at target:', { x: targetX, y: targetY });
        this.lastShot = now;
        this.fireProjectiles(targetX, targetY);
    }

    protected abstract fireProjectiles(targetX: number, targetY: number): void;

    public getBullets(): Phaser.Physics.Arcade.Group {
        return this.bullets;
    }

    public updateDamage(newDamage: number): void {
        const oldDamage = this.stats.damage;
        // Create a new stats object to ensure the update is properly registered
        this.stats = {
            ...this.stats,
            damage: newDamage
        };
        console.log('[Weapon] Damage updated:', {
            oldDamage,
            newDamage,
            currentStats: this.stats
        });
    }

    public updateFireRate(newFireRate: number): void {
        console.log('[Weapon] Updating fire rate to:', newFireRate);
        this.stats.fireRate = newFireRate;
    }

    public getStats(): WeaponStats {
        return { ...this.stats };
    }

    public getDamage(): number {
        const damage = this.stats.damage;
        console.log('[Weapon] Getting damage:', {
            damage,
            currentStats: this.stats
        });
        return damage;
    }

    public getFireRate(): number {
        return this.stats.fireRate;
    }
} 