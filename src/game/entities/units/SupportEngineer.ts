import { BaseUnit } from './BaseUnit';
import MainScene from '../../scenes/MainScene';

export class SupportEngineer extends BaseUnit {
    private static readonly SHIELD_BOOST_RANGE = 150;
    private static readonly SHIELD_BOOST_AMOUNT = 2; // Additional shield regen per second
    private shieldBoosterGraphics: Phaser.GameObjects.Graphics;
    private boostedUnits: Set<BaseUnit> = new Set();

    constructor(scene: MainScene, x: number, y: number) {
        super(
            scene,
            x,
            y,
            'engineerUnit', // We'll create this texture
            120, // Health
            80,  // Shield
            6,   // Shield regen per second
            0    // No delay on shield regen
        );

        // Create visual indicator for shield boost range
        this.shieldBoosterGraphics = scene.add.graphics();
        this.updateBoostRange();
    }

    update(time: number) {
        super.update(time);
        
        if (!this.active) return;

        // Update boost range visualization
        this.updateBoostRange();

        // Find units in range and boost their shields
        const nearbyUnits = this.scene.getFriendlyUnits().filter(unit => 
            unit !== this && 
            Phaser.Math.Distance.Between(this.x, this.y, unit.x, unit.y) <= SupportEngineer.SHIELD_BOOST_RANGE
        );

        // Remove units no longer in range
        for (const unit of this.boostedUnits) {
            if (!nearbyUnits.includes(unit)) {
                this.boostedUnits.delete(unit);
                this.removeShieldBoost(unit);
            }
        }

        // Add new units in range
        for (const unit of nearbyUnits) {
            if (!this.boostedUnits.has(unit)) {
                this.boostedUnits.add(unit);
                this.applyShieldBoost(unit);
            }
        }
    }

    private updateBoostRange() {
        this.shieldBoosterGraphics.clear();
        this.shieldBoosterGraphics.lineStyle(1, 0x00ffff, 0.3);
        this.shieldBoosterGraphics.strokeCircle(this.x, this.y, SupportEngineer.SHIELD_BOOST_RANGE);
    }

    private applyShieldBoost(unit: BaseUnit) {
        // Increase shield regen rate
        unit.boostShieldRegen(SupportEngineer.SHIELD_BOOST_AMOUNT);
    }

    private removeShieldBoost(unit: BaseUnit) {
        // Remove shield regen boost
        unit.boostShieldRegen(-SupportEngineer.SHIELD_BOOST_AMOUNT);
    }

    public destroy(fromScene?: boolean): void {
        // Remove boosts from all affected units
        this.boostedUnits.forEach(unit => this.removeShieldBoost(unit));
        this.shieldBoosterGraphics.destroy();
        super.destroy(fromScene);
    }
} 