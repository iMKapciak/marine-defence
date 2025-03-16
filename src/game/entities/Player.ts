import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from './units/BaseUnit';
import { PlayerClass } from '../types/PlayerData';
import { AssaultRifle } from '../weapons/AssaultRifle';
import { SMG } from '../weapons/SMG';
import { Shotgun } from '../weapons/Shotgun';
import { Pistol } from '../weapons/Pistol';

export class Player extends BaseUnit {
    private keys: { [key: string]: Phaser.Input.Keyboard.Key };
    private playerClass: PlayerClass;

    constructor(scene: MainScene, x: number, y: number, playerClass: PlayerClass) {
        super(scene, x, y, 'player');
        this.playerClass = playerClass;

        // Set up input keys
        this.keys = scene.input.keyboard!.addKeys('W,A,S,D') as { [key: string]: Phaser.Input.Keyboard.Key };

        // Set stats based on class
        switch (playerClass) {
            case PlayerClass.HEAVY:
                this.maxHealth = 200;
                this.speed = 80;
                break;
            case PlayerClass.SPEEDY:
                this.maxHealth = 100;
                this.speed = 150;
                break;
            case PlayerClass.ASSAULT:
                this.maxHealth = 120;
                this.speed = 100;
                break;
            case PlayerClass.ENGINEER:
                this.maxHealth = 90;
                this.speed = 120;
                break;
        }
        this.health = this.maxHealth;

        // Initialize weapon
        this.initWeapon();
    }

    protected initWeapon(): void {
        switch (this.playerClass) {
            case PlayerClass.HEAVY:
                this.weapon = new Shotgun(this.scene, this);
                break;
            case PlayerClass.SPEEDY:
                this.weapon = new SMG(this.scene, this);
                break;
            case PlayerClass.ASSAULT:
                this.weapon = new AssaultRifle(this.scene, this);
                break;
            case PlayerClass.ENGINEER:
                this.weapon = new Pistol(this.scene, this);
                break;
        }
    }

    update(time: number) {
        if (!this.active) return;

        // Get keyboard state
        const cursors = this.scene.input.keyboard!.createCursorKeys();

        // Movement
        let velocityX = 0;
        let velocityY = 0;

        if (this.keys.A.isDown || cursors.left.isDown) velocityX -= this.speed;
        if (this.keys.D.isDown || cursors.right.isDown) velocityX += this.speed;
        if (this.keys.W.isDown || cursors.up.isDown) velocityY -= this.speed;
        if (this.keys.S.isDown || cursors.down.isDown) velocityY += this.speed;

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            const normalizer = Math.sqrt(2) / 2;
            velocityX *= normalizer;
            velocityY *= normalizer;
        }

        this.setVelocity(velocityX, velocityY);

        // Rotate player to face mouse
        const pointer = this.scene.input.activePointer;
        this.rotation = Phaser.Math.Angle.Between(
            this.x, this.y,
            pointer.x + this.scene.cameras.main.scrollX,
            pointer.y + this.scene.cameras.main.scrollY
        );

        // Shooting
        if (pointer.isDown) {
            this.shoot(
                pointer.x + this.scene.cameras.main.scrollX,
                pointer.y + this.scene.cameras.main.scrollY
            );
        }

        super.update(time);
    }
} 