import Phaser from 'phaser';
import { PlayerClass } from '../types/PlayerData';

interface ClassInfo {
    name: PlayerClass;
    description: string;
    color: number;
    weapons: string[];
    avatar: string;
}

export class ClassPanel extends Phaser.GameObjects.Container {
    private selectedClass: PlayerClass | null = null;
    private isReady: boolean = false;
    private classButtons: Map<PlayerClass, Phaser.GameObjects.Container> = new Map();
    private readyButton: Phaser.GameObjects.Container;
    private onClassSelect: (playerClass: PlayerClass) => void;
    private onReadyToggle: (isReady: boolean) => void;

    private readonly PANEL_WIDTH = 400;
    private readonly PANEL_HEIGHT = 600;
    private readonly BUTTON_WIDTH = 180;
    private readonly BUTTON_HEIGHT = 220;
    private readonly BUTTON_SPACING = 20;

    private readonly CLASS_INFO: ClassInfo[] = [
        {
            name: PlayerClass.HEAVY,
            description: 'Heavy armored unit with powerful weapons\nbut slower movement',
            color: 0x8B0000,
            weapons: ['Minigun', 'Rocket Launcher'],
            avatar: 'heavy'
        },
        {
            name: PlayerClass.SPEEDY,
            description: 'Fast and agile unit with light weapons\nand high mobility',
            color: 0x4169E1,
            weapons: ['SMG', 'Pistol'],
            avatar: 'light'
        },
        {
            name: PlayerClass.ASSAULT,
            description: 'Balanced unit with medium armor\nand versatile weapons',
            color: 0x006400,
            weapons: ['Assault Rifle', 'Grenades'],
            avatar: 'assault'
        },
        {
            name: PlayerClass.ENGINEER,
            description: 'Support unit that can repair allies\nand deploy turrets',
            color: 0xDAA520,
            weapons: ['Repair Tool', 'Shotgun'],
            avatar: 'engineer'
        }
    ];

    constructor(scene: Phaser.Scene, x: number, y: number, onClassSelect: (playerClass: PlayerClass) => void, onReadyToggle: (isReady: boolean) => void) {
        super(scene, x, y);
        this.onClassSelect = onClassSelect;
        this.onReadyToggle = onReadyToggle;

        // Add panel background
        const background = scene.add.rectangle(0, 0, this.PANEL_WIDTH, this.PANEL_HEIGHT, 0x000033);
        background.setStrokeStyle(2, 0x3333cc);
        background.setOrigin(0.5);
        this.add(background);

        // Add title
        const title = scene.add.text(0, -this.PANEL_HEIGHT/2 + 20, 'SELECT YOUR CLASS', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.add(title);

        // Create class buttons in a 2x2 grid
        const startX = -this.BUTTON_WIDTH/2 - this.BUTTON_SPACING/2;
        const startY = -this.BUTTON_HEIGHT/2;
        
        this.CLASS_INFO.forEach((classInfo, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = startX + col * (this.BUTTON_WIDTH + this.BUTTON_SPACING);
            const y = startY + row * (this.BUTTON_HEIGHT + this.BUTTON_SPACING);
            
            const button = this.createClassButton(classInfo, x, y);
            this.classButtons.set(classInfo.name, button);
            this.add(button);
        });

        // Add ready button at the bottom
        this.readyButton = this.createReadyButton(0, this.PANEL_HEIGHT/2 - 50);
        this.add(this.readyButton);

        scene.add.existing(this);
    }

    private createClassButton(classInfo: ClassInfo, x: number, y: number): Phaser.GameObjects.Container {
        const container = new Phaser.GameObjects.Container(this.scene, x, y);

        // Button background
        const background = this.scene.add.rectangle(0, 0, this.BUTTON_WIDTH, this.BUTTON_HEIGHT, 0x1a1a1a);
        background.setStrokeStyle(2, classInfo.color);
        container.add(background);

        // Add class avatar
        const avatar = this.scene.add.image(0, -this.BUTTON_HEIGHT/4, classInfo.avatar);
        avatar.setDisplaySize(this.BUTTON_WIDTH - 20, this.BUTTON_HEIGHT/2);
        container.add(avatar);

        // Class name
        const name = this.scene.add.text(0, -this.BUTTON_HEIGHT/2 + 20, classInfo.name, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(name);

        // Class description
        const description = this.scene.add.text(0, this.BUTTON_HEIGHT/4, classInfo.description, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: this.BUTTON_WIDTH - 20 }
        }).setOrigin(0.5);
        container.add(description);

        // Make button interactive
        background.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                background.setStrokeStyle(3, 0xffffff);
            })
            .on('pointerout', () => {
                background.setStrokeStyle(2, this.selectedClass === classInfo.name ? 0xffff00 : classInfo.color);
            })
            .on('pointerdown', () => {
                this.selectClass(classInfo.name);
            });

        return container;
    }

    private createReadyButton(x: number, y: number): Phaser.GameObjects.Container {
        const container = new Phaser.GameObjects.Container(this.scene, x, y);

        // Button background
        const background = this.scene.add.rectangle(0, 0, 200, 50, 0x1a1a1a);
        background.setStrokeStyle(2, 0x666666);
        container.add(background);

        // Button text
        const text = this.scene.add.text(0, 0, 'READY', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#666666'
        }).setOrigin(0.5);
        container.add(text);

        // Make button interactive
        background.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                if (this.selectedClass) {
                    background.setStrokeStyle(3, this.isReady ? 0xff0000 : 0x00ff00);
                }
            })
            .on('pointerout', () => {
                background.setStrokeStyle(2, this.isReady ? 0x00ff00 : 0x666666);
            })
            .on('pointerdown', () => {
                if (this.selectedClass) {
                    this.toggleReady();
                }
            });

        return container;
    }

    private selectClass(playerClass: PlayerClass): void {
        // Reset previous selection
        if (this.selectedClass) {
            const prevButton = this.classButtons.get(this.selectedClass);
            const prevBackground = prevButton?.getAt(0) as Phaser.GameObjects.Rectangle;
            prevBackground?.setStrokeStyle(2, this.CLASS_INFO.find(c => c.name === this.selectedClass)?.color || 0xffffff);
        }

        // Set new selection
        this.selectedClass = playerClass;
        const button = this.classButtons.get(playerClass);
        const background = button?.getAt(0) as Phaser.GameObjects.Rectangle;
        background?.setStrokeStyle(2, 0xffff00);

        // Update ready button state
        const readyBackground = this.readyButton.getAt(0) as Phaser.GameObjects.Rectangle;
        const readyText = this.readyButton.getAt(1) as Phaser.GameObjects.Text;
        readyBackground.setStrokeStyle(2, 0x666666);
        readyText.setColor('#ffffff');

        this.onClassSelect(playerClass);
    }

    private toggleReady(): void {
        if (!this.selectedClass) return;

        this.isReady = !this.isReady;
        const readyBackground = this.readyButton.getAt(0) as Phaser.GameObjects.Rectangle;
        const readyText = this.readyButton.getAt(1) as Phaser.GameObjects.Text;

        if (this.isReady) {
            readyBackground.setStrokeStyle(2, 0x00ff00);
            readyText.setText('READY!');
            readyText.setColor('#00ff00');
        } else {
            readyBackground.setStrokeStyle(2, 0x666666);
            readyText.setText('READY');
            readyText.setColor('#ffffff');
        }

        this.onReadyToggle(this.isReady);
    }

    public setReady(isReady: boolean): void {
        if (this.isReady !== isReady) {
            this.toggleReady();
        }
    }
} 