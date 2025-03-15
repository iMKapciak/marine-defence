import Phaser from 'phaser';
import { PlayerClass } from '../scenes/LobbyScene';

interface ClassInfo {
    name: PlayerClass;
    description: string;
    color: number;
    weapons: string[];
}

export class ClassPanel {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private selectedClass: PlayerClass = PlayerClass.ASSAULT;
    private classButtons: Map<PlayerClass, Phaser.GameObjects.Container> = new Map();
    private descriptionText: Phaser.GameObjects.Text;
    private weaponsList: Phaser.GameObjects.Text;
    private readyButton: Phaser.GameObjects.Container;
    private isReady: boolean = false;

    private readonly PANEL_WIDTH = 300;
    private readonly PANEL_HEIGHT = 500;
    private readonly BUTTON_HEIGHT = 60;
    private readonly BUTTON_WIDTH = 280;
    private readonly BUTTON_PADDING = 10;

    private readonly CLASS_INFO: Record<PlayerClass, ClassInfo> = {
        [PlayerClass.HEAVY]: {
            name: PlayerClass.HEAVY,
            description: 'Heavy weapons specialist with strong defense',
            color: 0x0000ff,
            weapons: ['Heavy Machine Gun', 'Rocket Launcher', 'Shield Generator']
        },
        [PlayerClass.SPEEDY]: {
            name: PlayerClass.SPEEDY,
            description: 'Fast-moving scout with light weapons',
            color: 0xffff00,
            weapons: ['SMG', 'Pistol', 'Smoke Grenades']
        },
        [PlayerClass.ASSAULT]: {
            name: PlayerClass.ASSAULT,
            description: 'Balanced fighter with medium weapons',
            color: 0x00ff00,
            weapons: ['Assault Rifle', 'Shotgun', 'Frag Grenades']
        },
        [PlayerClass.ENGINEER]: {
            name: PlayerClass.ENGINEER,
            description: 'Support specialist with utility abilities',
            color: 0x00ffff,
            weapons: ['Combat Rifle', 'Repair Tool', 'Turret']
        }
    };

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.createBackground();
        this.createClassButtons();
        this.createDescriptionPanel();
        this.createReadyButton();

        // Set initial class
        this.selectClass(this.selectedClass);
    }

    private createBackground() {
        // Create panel background
        this.scene.add.rectangle(
            this.x,
            this.y,
            this.PANEL_WIDTH,
            this.PANEL_HEIGHT,
            0x333333,
            0.8
        ).setOrigin(0, 0);

        // Add title
        this.scene.add.text(
            this.x + this.PANEL_WIDTH / 2,
            this.y + 20,
            'Class Selection',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
    }

    private createClassButtons() {
        Object.values(PlayerClass).forEach((className, index) => {
            const button = this.createClassButton(
                this.x + this.PANEL_WIDTH / 2,
                this.y + 80 + index * (this.BUTTON_HEIGHT + this.BUTTON_PADDING),
                className
            );
            this.classButtons.set(className, button);
        });
    }

    private createClassButton(x: number, y: number, className: PlayerClass): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);
        const info = this.CLASS_INFO[className];

        const button = this.scene.add.rectangle(0, 0, this.BUTTON_WIDTH, this.BUTTON_HEIGHT, info.color, 0.8)
            .setInteractive()
            .on('pointerdown', () => this.selectClass(className));

        const text = this.scene.add.text(0, 0, className, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([button, text]);
        return container;
    }

    private createDescriptionPanel() {
        const descY = this.y + 350;
        
        this.descriptionText = this.scene.add.text(
            this.x + 10,
            descY,
            '',
            {
                fontSize: '16px',
                color: '#ffffff',
                wordWrap: { width: this.PANEL_WIDTH - 20 }
            }
        );

        this.weaponsList = this.scene.add.text(
            this.x + 10,
            descY + 60,
            '',
            {
                fontSize: '14px',
                color: '#aaaaaa',
                wordWrap: { width: this.PANEL_WIDTH - 20 }
            }
        );
    }

    private createReadyButton() {
        const y = this.y + this.PANEL_HEIGHT - 50;
        this.readyButton = this.scene.add.container(this.x + this.PANEL_WIDTH / 2, y);

        const button = this.scene.add.rectangle(0, 0, 200, 40, 0xff0000)
            .setInteractive()
            .on('pointerdown', () => this.toggleReady());

        const text = this.scene.add.text(0, 0, 'Ready', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.readyButton.add([button, text]);
    }

    private selectClass(className: PlayerClass) {
        // Update button visuals
        this.classButtons.forEach((button, buttonClass) => {
            const info = this.CLASS_INFO[buttonClass];
            const alpha = buttonClass === className ? 1 : 0.8;
            (button.list[0] as Phaser.GameObjects.Rectangle).setAlpha(alpha);
        });

        // Update selected class
        this.selectedClass = className;
        const info = this.CLASS_INFO[className];

        // Update description
        this.descriptionText.setText(info.description);
        this.weaponsList.setText(['Available Weapons:', ...info.weapons].join('\n'));

        // Emit class selection event
        this.scene.events.emit('classSelected', className);
    }

    private toggleReady() {
        this.isReady = !this.isReady;
        const button = this.readyButton.list[0] as Phaser.GameObjects.Rectangle;
        const text = this.readyButton.list[1] as Phaser.GameObjects.Text;

        button.setFillStyle(this.isReady ? 0x00ff00 : 0xff0000);
        text.setText(this.isReady ? 'Ready!' : 'Ready');

        // Emit ready status change event
        this.scene.events.emit('readyToggled');
    }

    public update() {
        // Add any necessary update logic here
    }
} 