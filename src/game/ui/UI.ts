import Phaser from 'phaser';

export class UI {
    private scene: Phaser.Scene;
    private healthBar: Phaser.GameObjects.Graphics;
    private shieldBar: Phaser.GameObjects.Graphics;
    private experienceBar: Phaser.GameObjects.Graphics;
    private waveText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        // Create UI elements
        this.healthBar = scene.add.graphics();
        this.shieldBar = scene.add.graphics();
        this.experienceBar = scene.add.graphics();
        
        // Wave counter
        this.waveText = scene.add.text(10, 10, 'Wave: 1', {
            fontSize: '20px',
            color: '#ffffff'
        });

        // Initial render
        this.updateBars();
    }

    private updateBars() {
        const player = (this.scene as any).player;
        if (!player) return;

        // Clear previous graphics
        this.healthBar.clear();
        this.shieldBar.clear();
        this.experienceBar.clear();

        // Health bar (red)
        const healthWidth = (player.getHealth() / player.getMaxHealth()) * 200;
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(10, 550, healthWidth, 20);
        this.healthBar.lineStyle(2, 0xffffff);
        this.healthBar.strokeRect(10, 550, 200, 20);

        // Shield bar (blue)
        const shieldWidth = (player.getShield() / player.getMaxShield()) * 200;
        this.shieldBar.fillStyle(0x0000ff);
        this.shieldBar.fillRect(10, 520, shieldWidth, 20);
        this.shieldBar.lineStyle(2, 0xffffff);
        this.shieldBar.strokeRect(10, 520, 200, 20);

        // Experience bar (yellow)
        const experienceWidth = ((this.scene as any).experience % 100) * 2; // 100 exp per level
        this.experienceBar.fillStyle(0xffff00);
        this.experienceBar.fillRect(10, 580, experienceWidth, 10);
        this.experienceBar.lineStyle(2, 0xffffff);
        this.experienceBar.strokeRect(10, 580, 200, 10);
    }

    public updateExperience(experience: number) {
        this.updateBars();
    }

    public updateWave(wave: number) {
        this.waveText.setText(`Wave: ${wave}`);
        this.updateBars();
    }
} 