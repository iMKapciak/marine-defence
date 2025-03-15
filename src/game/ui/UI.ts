import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';

export class UI {
    private scene: MainScene;
    private healthText: Phaser.GameObjects.Text;
    private characterLevelText: Phaser.GameObjects.Text;
    private gameLevelText: Phaser.GameObjects.Text;

    constructor(scene: MainScene) {
        this.scene = scene;
        
        // Health text (top left)
        this.healthText = scene.add.text(16, 16, 'Health: 100', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.healthText.setScrollFactor(0);

        // Character level (next to health)
        this.characterLevelText = scene.add.text(200, 16, 'Level: 1', {
            fontSize: '24px',
            color: '#ffff00'
        });
        this.characterLevelText.setScrollFactor(0);

        // Game level (top right)
        this.gameLevelText = scene.add.text(scene.scale.width - 150, 16, 'Wave: 1', {
            fontSize: '24px',
            color: '#00ff00'
        });
        this.gameLevelText.setScrollFactor(0);
    }

    public updateHealth(health: number): void {
        this.healthText.setText(`Health: ${Math.round(health)}`);
    }

    public updateCharacterLevel(level: number): void {
        this.characterLevelText.setText(`Level: ${level}`);
    }

    public updateGameLevel(level: number): void {
        this.gameLevelText.setText(`Wave: ${level}`);
    }

    public destroy(): void {
        // Clean up all UI elements
        if (this.healthText) {
            this.healthText.destroy();
        }
        if (this.characterLevelText) {
            this.characterLevelText.destroy();
        }
        if (this.gameLevelText) {
            this.gameLevelText.destroy();
        }
    }

    public cleanup(): void {
        try {
            // Hide all UI elements by setting their alpha to 0
            if (this.healthText) {
                this.healthText.alpha = 0;
            }
            if (this.characterLevelText) {
                this.characterLevelText.alpha = 0;
            }
            if (this.gameLevelText) {
                this.gameLevelText.alpha = 0;
            }
        } catch (error) {
            console.warn('Error during UI cleanup:', error);
        }
    }
} 