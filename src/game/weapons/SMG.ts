import { Weapon, WeaponStats } from './Weapon';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from '../entities/units/BaseUnit';
import { Bullet } from '../entities/Bullet';

export class SMG extends Weapon {
    private static readonly DEFAULT_STATS: WeaponStats = {
        damage: 15,
        speed: 700,
        range: 500,
        fireRate: 150, // 0.15 seconds between shots (very fast)
        spread: Math.PI / 32, // Moderate spread
        projectiles: 1 // Single bullet per shot
    };

    constructor(scene: MainScene, owner: BaseUnit) {
        super(scene, owner, SMG.DEFAULT_STATS);
    }

    protected fireProjectiles(targetX: number, targetY: number): void {
        const angle = Phaser.Math.Angle.Between(
            this.owner.x, this.owner.y,
            targetX, targetY
        );

        // Add moderate random spread
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