import Phaser from 'phaser';
import { SquadPanel } from '../ui/SquadPanel';
import { ClassPanel } from '../ui/ClassPanel';

export enum PlayerClass {
    HEAVY = 'HEAVY',
    SPEEDY = 'SPEEDY',
    ASSAULT = 'ASSAULT',
    ENGINEER = 'ENGINEER'
}

export interface PlayerData {
    id: string;
    name: string;
    class: PlayerClass;
    isReady: boolean;
    isHost: boolean;
}

export class LobbyScene extends Phaser.Scene {
    private squadPanel: SquadPanel;
    private classPanel: ClassPanel;
    private players: Map<string, PlayerData> = new Map();
    private localPlayerId: string;
    private countdownText: Phaser.GameObjects.Text;
    private countdownTimer: number = 0;
    private readonly COUNTDOWN_DURATION = 5; // seconds

    constructor() {
        super({ key: 'LobbyScene' });
    }

    create() {
        // Set up background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
            .setOrigin(0, 0);

        // Create panels
        this.squadPanel = new SquadPanel(this, 50, 50);
        this.classPanel = new ClassPanel(this, this.cameras.main.width - 350, 50);

        // Initialize local player (temporary ID for testing)
        this.localPlayerId = 'player1';
        this.players.set(this.localPlayerId, {
            id: this.localPlayerId,
            name: 'Player 1',
            class: PlayerClass.ASSAULT,
            isReady: false,
            isHost: true
        });

        // Add some test players (remove in production)
        this.addTestPlayers();

        // Set up event listeners
        this.events.on('classSelected', this.handleClassSelection, this);
        this.events.on('readyToggled', this.handleReadyToggle, this);

        // Create countdown text (hidden initially)
        this.countdownText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            '',
            {
                fontSize: '48px',
                color: '#ffffff'
            }
        ).setOrigin(0.5).setVisible(false);
    }

    private addTestPlayers() {
        // Add some test players (remove in production)
        const testPlayers: PlayerData[] = [
            {
                id: 'player2',
                name: 'Player 2',
                class: PlayerClass.HEAVY,
                isReady: false,
                isHost: false
            },
            {
                id: 'player3',
                name: 'Player 3',
                class: PlayerClass.SPEEDY,
                isReady: false,
                isHost: false
            }
        ];

        testPlayers.forEach(player => this.players.set(player.id, player));
        this.updateSquadPanel();
    }

    private handleClassSelection(className: PlayerClass) {
        const player = this.players.get(this.localPlayerId);
        if (player) {
            player.class = className;
            this.updateSquadPanel();
        }
    }

    private handleReadyToggle() {
        const player = this.players.get(this.localPlayerId);
        if (player) {
            player.isReady = !player.isReady;
            this.updateSquadPanel();
            this.checkGameStart();
        }
    }

    private updateSquadPanel() {
        this.squadPanel.updatePlayers(Array.from(this.players.values()));
    }

    private checkGameStart() {
        // Check if at least one player is ready
        const anyPlayerReady = Array.from(this.players.values()).some(player => player.isReady);
        if (anyPlayerReady) {
            this.startCountdown();
        } else {
            this.stopCountdown();
        }
    }

    private startCountdown() {
        this.countdownTimer = this.COUNTDOWN_DURATION;
        this.countdownText.setVisible(true);
        this.updateCountdown();
    }

    private stopCountdown() {
        this.countdownTimer = 0;
        this.countdownText.setVisible(false);
    }

    private updateCountdown() {
        if (this.countdownTimer > 0) {
            this.countdownText.setText(`Match starting in ${this.countdownTimer}`);
            this.countdownTimer--;
            this.time.delayedCall(1000, () => this.updateCountdown());
        } else if (this.countdownTimer === 0) {
            this.startGame();
        }
    }

    private startGame() {
        // TODO: Implement game start logic
        // This will transition to the main game scene
        console.log('Starting game with players:', Array.from(this.players.values()));
        this.scene.start('MainScene', {
            players: Array.from(this.players.values())
        });
    }

    update() {
        // Add any necessary update logic here
    }
} 