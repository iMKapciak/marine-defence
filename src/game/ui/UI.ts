import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';

export class UI {
    private scene: MainScene;
    private experienceText: Phaser.GameObjects.Text;
    private healthText: Phaser.GameObjects.Text;

    constructor(scene: MainScene) {
        this.scene = scene;

        // Create UI elements
        this.experienceText = scene.add.text(10, 10, 'XP: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.experienceText.setScrollFactor(0);

        this.healthText = scene.add.text(10, 40, 'Health: 100', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.healthText.setScrollFactor(0);
    }

    public updateExperience(experience: number) {
        this.experienceText.setText(`XP: ${experience}`);
    }

    public updateHealth(health: number) {
        this.healthText.setText(`Health: ${health}`);
    }
} 