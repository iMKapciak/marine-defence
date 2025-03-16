import Phaser from 'phaser';
import { ClassPanel } from '../ui/ClassPanel';
import { PlayerClass, PlayerData } from '../types/PlayerData';

export default class LobbyScene extends Phaser.Scene {
    private players: Map<string, PlayerData> = new Map();
    private classPanel!: ClassPanel;
    private countdownText!: Phaser.GameObjects.Text;
    private countdownTimer?: Phaser.Time.TimerEvent;
    private startCountdown: number = 5; // Countdown time in seconds

    constructor() {
        super({ key: 'LobbyScene' });
    }

    preload() {
        // Create placeholder images for classes
        const graphics = this.add.graphics();
        
        // Heavy - Red square
        graphics.clear();
        graphics.fillStyle(0x8B0000);
        graphics.fillRect(0, 0, 100, 100);
        graphics.generateTexture('heavy', 100, 100);
        
        // Light - Blue square
        graphics.clear();
        graphics.fillStyle(0x4169E1);
        graphics.fillRect(0, 0, 100, 100);
        graphics.generateTexture('light', 100, 100);
        
        // Assault - Green square
        graphics.clear();
        graphics.fillStyle(0x006400);
        graphics.fillRect(0, 0, 100, 100);
        graphics.generateTexture('assault', 100, 100);
        
        // Engineer - Gold square
        graphics.clear();
        graphics.fillStyle(0xDAA520);
        graphics.fillRect(0, 0, 100, 100);
        graphics.generateTexture('engineer', 100, 100);
        
        graphics.destroy();
    }

    create() {
        // Set background
        const background = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000022);
        background.setOrigin(0, 0);

        // Add title
        const title = this.add.text(this.cameras.main.centerX, 50, 'MARINE DEFENSE', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#3333cc',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Add subtitle
        const subtitle = this.add.text(this.cameras.main.centerX, 110, 'LOBBY', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#3333cc'
        }).setOrigin(0.5);

        // Create local player
        const localPlayer: PlayerData = {
            id: 'player1',
            name: 'Player 1',
            class: PlayerClass.ASSAULT, // Set default class
            isReady: false,
            isHost: true
        };
        this.players.set(localPlayer.id, localPlayer);

        // Create class panel
        this.classPanel = new ClassPanel(
            this,
            this.cameras.main.centerX,
            this.cameras.main.centerY + 50,
            (playerClass: PlayerClass) => this.handleClassSelect(localPlayer.id, playerClass),
            (isReady: boolean) => this.handleReadyToggle(localPlayer.id, isReady)
        );

        // Add countdown text (hidden initially)
        this.countdownText = this.add.text(this.cameras.main.centerX, 150, '', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#00ff00'
        }).setOrigin(0.5).setVisible(false);

        // Add decorative elements
        this.addDecorations();
    }

    private addDecorations() {
        // Add animated background elements
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.circle(x, y, size, 0x3333cc, 0.5);

            this.tweens.add({
                targets: star,
                alpha: 0,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }

        // Add border lines
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x3333cc, 0.5);
        graphics.strokeRect(10, 10, this.cameras.main.width - 20, this.cameras.main.height - 20);
    }

    private handleClassSelect(playerId: string, playerClass: PlayerClass) {
        const player = this.players.get(playerId);
        if (player) {
            player.class = playerClass;
            this.checkGameStart();
        }
    }

    private handleReadyToggle(playerId: string, isReady: boolean) {
        const player = this.players.get(playerId);
        if (player) {
            player.isReady = isReady;
            this.checkGameStart();
        }
    }

    private checkGameStart() {
        const readyPlayers = Array.from(this.players.values()).filter(p => p.isReady && p.class !== null);
        
        if (readyPlayers.length > 0) {
            if (!this.countdownTimer?.getProgress()) {
                this.startGameCountdown();
            }
        } else {
            if (this.countdownTimer) {
                this.countdownTimer.remove();
                this.countdownText.setVisible(false);
            }
        }
    }

    private startGameCountdown() {
        let timeLeft = this.startCountdown;
        this.countdownText.setText(`Starting in ${timeLeft}...`).setVisible(true);

        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                timeLeft--;
                if (timeLeft > 0) {
                    this.countdownText.setText(`Starting in ${timeLeft}...`);
                } else {
                    this.startGame();
                }
            },
            repeat: this.startCountdown - 1
        });
    }

    private startGame() {
        const readyPlayers = Array.from(this.players.values()).filter(p => p.isReady && p.class !== null);
        
        console.log('Starting game with players:', readyPlayers);
        
        if (readyPlayers.length > 0) {
            // Ensure at least one player has a class selected
            if (!readyPlayers.some(p => p.class !== null)) {
                console.error('No players have selected a class');
                return;
            }

            this.scene.start('MainScene', {
                players: readyPlayers
            });
        } else {
            console.error('No ready players to start the game');
        }
    }
} 