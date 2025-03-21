import { Weapon, WeaponStats } from './Weapon';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from '../entities/units/BaseUnit';
import { Bullet } from '../entities/Bullet';

export class AssaultRifle extends Weapon {
    public static readonly DEFAULT_STATS: WeaponStats = {
        damage: 35,
        speed: 800,
        range: 800,
        fireRate: 500, // 0.5 seconds between shots
        spread: Math.PI / 64, // Very small spread for accuracy
        projectiles: 1 // Single bullet per shot
    };

    constructor(scene: MainScene, owner: BaseUnit) {
        super(scene, owner, AssaultRifle.DEFAULT_STATS);
    }

    protected fireProjectiles(targetX: number, targetY: number): void {
        const angle = Phaser.Math.Angle.Between(
            this.owner.x, this.owner.y,
            targetX, targetY
        );

        // Add slight random spread for realism
        const finalAngle = angle + (Math.random() - 0.5) * this.stats.spread;

        const bullet = this.bullets.get(this.owner.x, this.owner.y, 'bullet') as Bullet;
        if (bullet) {
            bullet.init(this.getDamage(), this.stats.speed, this.stats.range, this);
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.fire(finalAngle);
            console.log('[AssaultRifle] Fired bullet with damage:', this.getDamage());
        }
    }
} 