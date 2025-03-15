import { BaseUnit } from './BaseUnit';
import MainScene from '../../scenes/MainScene';

export class AssaultMarine extends BaseUnit {
    constructor(scene: MainScene, x: number, y: number) {
        super(
            scene,
            x,
            y,
            'marineUnit', // We'll create this texture
            150, // Health
            100, // Shield
            7,   // Shield regen per second
            0    // No delay on shield regen
        );
    }
} 