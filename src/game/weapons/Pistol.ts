import { Weapon, WeaponStats } from './Weapon';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from '../entities/units/BaseUnit';
import { Bullet } from '../entities/Bullet';

export class Pistol extends Weapon {
    private static readonly DEFAULT_STATS: WeaponStats = {
        damage: 40,
        speed: 650,
        range: 500,
        fireRate: 700, // 0.7 seconds between shots
        spread: Math.PI / 48, // Small spread
        projectiles: 1 // Single bullet per shot
    };

    constructor(scene: MainScene, owner: BaseUnit) {
        super(scene, owner, Pistol.DEFAULT_STATS);
    }

    protected fireProjectiles(targetX: number, targetY: number): void {
        const angle = Phaser.Math.Angle.Between(
            this.owner.x, this.owner.y,
            targetX, targetY
        );

        // Add minimal random spread for accuracy
        const finalAngle = angle + (Math.random() - 0.5) * this.stats.spread;

        const bullet = this.bullets.get(this.owner.x, this.owner.y, 'bullet') as Bullet;
        if (bullet) {
            bullet.init(this.stats.damage, this.stats.speed, this.stats.range);
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.fire(finalAngle);
        }
    }
} 