import { Weapon, WeaponStats } from './Weapon';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from '../entities/units/BaseUnit';
import { Bullet } from '../entities/Bullet';

export class SMG extends Weapon {
    public static readonly DEFAULT_STATS: WeaponStats = {
        damage: 15,
        speed: 700,
        range: 500,
        fireRate: 150, // 0.15 seconds between shots (very fast)
        spread: Math.PI / 32, // Moderate spread
        projectiles: 1 // Single bullet per shot
    };

    constructor(scene: MainScene, owner: BaseUnit) {
        super(scene, owner, { ...SMG.DEFAULT_STATS });
    }

    protected fireProjectiles(targetX: number, targetY: number): void {
        const bullet = this.bullets.get() as Bullet;
        if (!bullet) return;

        const currentDamage = this.getDamage();
        console.log('[SMG] Firing bullet:', {
            damage: currentDamage,
            stats: this.stats,
            defaultStats: SMG.DEFAULT_STATS,
            position: { x: this.owner.x, y: this.owner.y },
            target: { x: targetX, y: targetY }
        });

        bullet.setPosition(this.owner.x, this.owner.y);
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.init(currentDamage, this.stats.speed, this.stats.range, this);

        const angle = Phaser.Math.Angle.Between(
            this.owner.x, this.owner.y,
            targetX, targetY
        );

        // Add random spread
        const finalAngle = angle + (Math.random() - 0.5) * this.stats.spread;
        bullet.fire(finalAngle);

        // Verify bullet state after firing
        console.log('[SMG] Bullet fired:', {
            damage: bullet.getDamage(),
            active: bullet.active,
            visible: bullet.visible,
            weaponStats: this.stats
        });
    }

    public getDamage(): number {
        const damage = super.getDamage();
        console.log('[SMG] Getting damage:', {
            damage,
            stats: this.stats,
            defaultStats: SMG.DEFAULT_STATS
        });
        return damage;
    }
} 