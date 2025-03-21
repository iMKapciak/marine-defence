import { Weapon, WeaponStats } from './Weapon';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from '../entities/units/BaseUnit';
import { Bullet } from '../entities/Bullet';

export class Shotgun extends Weapon {
    public static readonly DEFAULT_STATS: WeaponStats = {
        damage: 15,
        speed: 500,
        range: 300,
        fireRate: 800, // 0.8 seconds between shots
        spread: Math.PI / 8, // 22.5 degrees spread
        projectiles: 5 // 5 pellets per shot
    };

    constructor(scene: MainScene, owner: BaseUnit) {
        super(scene, owner, Shotgun.DEFAULT_STATS);
    }

    protected fireProjectiles(targetX: number, targetY: number): void {
        const angle = Phaser.Math.Angle.Between(
            this.owner.x, this.owner.y,
            targetX, targetY
        );

        // Calculate spread angles for each projectile
        const angleStep = this.stats.spread / (this.stats.projectiles - 1);
        const startAngle = angle - this.stats.spread / 2;

        for (let i = 0; i < this.stats.projectiles; i++) {
            const bullet = this.bullets.get(this.owner.x, this.owner.y, 'bullet') as Bullet;
            if (bullet) {
                const projectileAngle = startAngle + (angleStep * i);
                bullet.init(this.getDamage(), this.stats.speed, this.stats.range, this);
                bullet.setActive(true);
                bullet.setVisible(true);
                bullet.fire(projectileAngle);
            }
        }
        console.log('[Shotgun] Fired bullets with damage:', this.getDamage());
    }
} 