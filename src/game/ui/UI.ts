import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';
import { Scene } from 'phaser';
import { PlayerClass } from '../types/PlayerData';

export class UI {
    private readonly BAR_WIDTH = 60;
    private readonly BAR_HEIGHT = 6;
    private readonly BAR_SPACING = 4;
    private readonly AVATAR_SIZE = 64;
    private scene: Scene;
    private player: any;
    private shieldBarBackground: Phaser.GameObjects.Graphics | null = null;
    private shieldBarFill: Phaser.GameObjects.Graphics | null = null;
    private healthBarBackground: Phaser.GameObjects.Graphics | null = null;
    private healthBarFill: Phaser.GameObjects.Graphics | null = null;
    private classAvatar: Phaser.GameObjects.Sprite | null = null;
    private characterLevelText!: Phaser.GameObjects.Text;
    private gameLevelText!: Phaser.GameObjects.Text;
    private lastHealth: number = 0;
    private lastShieldValue: number = 0;

    constructor(scene: Scene, player: any) {
        this.scene = scene;
        this.player = player;
        this.createUI();
    }

    private createUI() {
        // Create health bar graphics objects
        this.healthBarBackground = this.scene.add.graphics();
        this.healthBarFill = this.scene.add.graphics();
        
        // Create shield bar graphics objects
        this.shieldBarBackground = this.scene.add.graphics();
        this.shieldBarFill = this.scene.add.graphics();
        
        // Create class avatar
        const avatarSize = 64;
        const padding = 10;
        const avatarKey = `${this.player.playerClass.toLowerCase()}_avatar`;
        this.classAvatar = this.scene.add.sprite(
            padding + avatarSize/2,
            this.scene.cameras.main.height - padding - avatarSize/2,
            avatarKey
        );
        this.classAvatar.setDisplaySize(avatarSize, avatarSize);
        this.classAvatar.setScrollFactor(0);

        // Create character level text
        this.characterLevelText = this.scene.add.text(
            padding * 2 + avatarSize,
            this.scene.cameras.main.height - padding - avatarSize/2,
            'Level: 1',
            { fontSize: '24px', color: '#ffffff' }
        );
        this.characterLevelText.setScrollFactor(0);

        // Create game level text
        this.gameLevelText = this.scene.add.text(
            this.scene.cameras.main.width - padding,
            padding,
            'Wave: 1',
            { fontSize: '24px', color: '#ffffff' }
        );
        this.gameLevelText.setOrigin(1, 0);
        this.gameLevelText.setScrollFactor(0);
        
        // Initial updates
        this.updateHealth(this.player.getHealth());
        this.updateShield();
    }

    public update() {
        // Only update if player exists and values have changed
        if (!this.player) return;

        const currentHealth = this.player.getHealth();
        if (currentHealth !== this.lastHealth) {
            this.updateHealth(currentHealth);
            this.lastHealth = currentHealth;
        }

        if (this.player.shield) {
            const currentShield = this.player.shield.getCurrentShields();
            if (currentShield !== this.lastShieldValue) {
                this.updateShield();
                this.lastShieldValue = currentShield;
            }
        }

        // Always update positions even if values haven't changed
        this.updateHealthBarPosition();
        this.updateShieldBarPosition();
    }

    private updateHealthBarPosition() {
        const barX = this.player.x - this.BAR_WIDTH / 2;
        const barY = this.player.y - 30;
        
        // Update background position
        this.healthBarBackground?.clear();
        this.healthBarBackground?.fillStyle(0x333333);
        this.healthBarBackground?.fillRect(barX, barY, this.BAR_WIDTH, this.BAR_HEIGHT);
        
        // Update fill position
        const healthPercentage = Math.max(0, Math.min(1, this.player.getHealth() / this.player.getMaxHealth()));
        this.healthBarFill?.clear();
        this.healthBarFill?.fillStyle(0xff0000);
        this.healthBarFill?.fillRect(barX, barY, this.BAR_WIDTH * healthPercentage, this.BAR_HEIGHT);
    }

    private updateShieldBarPosition() {
        if (!this.player.shield) return;

        const barX = this.player.x - this.BAR_WIDTH / 2;
        const barY = this.player.y - 30 - this.BAR_HEIGHT - this.BAR_SPACING;
        
        // Update background position
        this.shieldBarBackground?.clear();
        this.shieldBarBackground?.fillStyle(0x333333);
        this.shieldBarBackground?.fillRect(barX, barY, this.BAR_WIDTH, this.BAR_HEIGHT);
        
        // Update fill position
        const shieldPercentage = this.player.shield.getCurrentShields() / this.player.shield.getMaxShields();
        this.shieldBarFill?.clear();
        this.shieldBarFill?.fillStyle(0x00ffff);
        this.shieldBarFill?.fillRect(barX, barY, this.BAR_WIDTH * shieldPercentage, this.BAR_HEIGHT);
    }

    public updateHealth(health: number) {
        this.lastHealth = health;
        this.updateHealthBarPosition();
    }

    public updateShield() {
        if (!this.player.shield) {
            console.warn('Player shield not initialized');
            return;
        }
        this.lastShieldValue = this.player.shield.getCurrentShields();
        this.updateShieldBarPosition();
    }

    public updateCharacterLevel(level: number) {
        this.characterLevelText.setText(`Level: ${level}`);
    }

    public updateGameLevel(level: number) {
        this.gameLevelText.setText(`Wave: ${level}`);
    }

    // Alias for updateCharacterLevel to match the MainScene's call
    public updateLevel(level: number) {
        this.updateCharacterLevel(level);
    }

    public updateExperience(current: number, total: number) {
        // For now, we don't show experience progress
        // You can add an experience bar here if needed
    }

    public cleanup() {
        this.characterLevelText.destroy();
        this.gameLevelText.destroy();
        this.classAvatar?.destroy();
        this.shieldBarBackground?.destroy();
        this.shieldBarFill?.destroy();
        this.healthBarBackground?.destroy();
        this.healthBarFill?.destroy();
    }
} 