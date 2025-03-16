import Phaser from 'phaser';
import { PlayerData, PlayerClass } from '../types/PlayerData';

export class SquadPanel {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private slots: SquadSlot[] = [];
    private readonly SLOT_HEIGHT = 100;
    private readonly SLOT_WIDTH = 300;
    private readonly SLOT_PADDING = 10;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // Create panel background
        this.createBackground();

        // Create slots
        for (let i = 0; i < 4; i++) {
            this.slots.push(new SquadSlot(
                scene,
                x,
                y + (this.SLOT_HEIGHT + this.SLOT_PADDING) * i,
                this.SLOT_WIDTH,
                this.SLOT_HEIGHT
            ));
        }
    }

    private createBackground() {
        const totalHeight = (this.SLOT_HEIGHT + this.SLOT_PADDING) * 4;
        this.scene.add.rectangle(
            this.x - 10,
            this.y - 10,
            this.SLOT_WIDTH + 20,
            totalHeight + 20,
            0x333333,
            0.8
        ).setOrigin(0, 0);

        this.scene.add.text(
            this.x,
            this.y - 40,
            'Squad Members',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0, 0);
    }

    public updatePlayers(players: PlayerData[]) {
        // Reset all slots
        this.slots.forEach(slot => slot.clear());

        // Update slots with player data
        players.forEach((player, index) => {
            if (index < this.slots.length) {
                this.slots[index].setPlayer(player);
            }
        });

        // Show invite buttons for empty slots
        for (let i = players.length; i < this.slots.length; i++) {
            this.slots[i].showInviteButton();
        }
    }

    public update() {
        // Update each slot
        this.slots.forEach(slot => slot.update());
    }
}

class SquadSlot {
    private scene: Phaser.Scene;
    private background: Phaser.GameObjects.Rectangle;
    private nameText: Phaser.GameObjects.Text;
    private classText: Phaser.GameObjects.Text;
    private readyIndicator: Phaser.GameObjects.Rectangle;
    private inviteButton: Phaser.GameObjects.Container;
    private kickButton: Phaser.GameObjects.Container;
    private currentPlayer: PlayerData | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        this.scene = scene;

        // Create slot background
        this.background = scene.add.rectangle(x, y, width, height, 0x222222)
            .setOrigin(0, 0)
            .setInteractive();

        // Create text elements
        this.nameText = scene.add.text(x + 10, y + 10, '', {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.classText = scene.add.text(x + 10, y + 40, '', {
            fontSize: '16px',
            color: '#aaaaaa'
        });

        // Create ready indicator
        this.readyIndicator = scene.add.rectangle(
            x + width - 30,
            y + height / 2,
            20,
            20,
            0xff0000
        ).setOrigin(0.5);

        // Create kick button (hidden by default)
        this.kickButton = this.createKickButton(x + width - 40, y + height - 30);
        this.kickButton.setVisible(false);

        // Create invite button (hidden by default)
        this.inviteButton = this.createInviteButton(x + width / 2, y + height / 2);
        this.inviteButton.setVisible(false);
    }

    private createKickButton(x: number, y: number): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);

        const button = this.scene.add.rectangle(0, 0, 30, 30, 0x880000)
            .setInteractive()
            .on('pointerdown', () => {
                if (this.currentPlayer) {
                    this.scene.events.emit('playerKicked', this.currentPlayer.id);
                }
            });

        const text = this.scene.add.text(0, 0, 'X', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([button, text]);
        return container;
    }

    private createInviteButton(x: number, y: number): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);

        const button = this.scene.add.rectangle(0, 0, 160, 40, 0x008800)
            .setInteractive()
            .on('pointerdown', () => {
                // Trigger invite flow
                console.log('Invite player clicked');
            });

        const text = this.scene.add.text(0, 0, '+ Invite Player', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([button, text]);
        return container;
    }

    public setPlayer(player: PlayerData) {
        this.currentPlayer = player;
        this.nameText.setText(player.name);
        this.classText.setText(`Class: ${player.class}`);
        this.readyIndicator.setFillStyle(player.isReady ? 0x00ff00 : 0xff0000);
        this.inviteButton.setVisible(false);
        this.kickButton.setVisible(true);

        // Update background based on host status
        this.background.setFillStyle(player.isHost ? 0x333366 : 0x222222);
    }

    public clear() {
        this.currentPlayer = null;
        this.nameText.setText('');
        this.classText.setText('');
        this.readyIndicator.setVisible(false);
        this.kickButton.setVisible(false);
        this.inviteButton.setVisible(false);
        this.background.setFillStyle(0x222222);
    }

    public showInviteButton() {
        this.clear();
        this.inviteButton.setVisible(true);
    }

    public update() {
        // Add any necessary update logic here
    }
} 