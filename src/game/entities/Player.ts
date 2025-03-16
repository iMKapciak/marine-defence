import { Scene } from 'phaser';
import { PlayerClass } from '../types/PlayerData';
import { Weapon } from '../weapons/Weapon';
import { AssaultRifle } from '../weapons/AssaultRifle';
import { SMG } from '../weapons/SMG';
import { Shotgun } from '../weapons/Shotgun';
import { Pistol } from '../weapons/Pistol';
import { BaseUnit } from './units/BaseUnit';
import { Shield, ShieldConfig } from './Shield';
import MainScene from '../scenes/MainScene';

export class Player extends BaseUnit {
    private playerClass: PlayerClass;
    private shieldConfig: ShieldConfig = {
        maxShields: 100,
        regenRate: 10,
        regenDelay: 3000,
        damageReduction: 1
    };
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private mousePointer: Phaser.Input.Pointer;

    constructor(scene: MainScene, x: number, y: number, playerClass: PlayerClass) {
        super(scene, x, y, 'player');
        this.playerClass = playerClass;
        
        // Initialize input
        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
        } else {
            console.error('Keyboard input not available');
        }
        this.mousePointer = scene.input.activePointer;
        
        // Set stats based on class
        switch (playerClass) {
            case PlayerClass.HEAVY:
                this.maxHealth = 150;
                this.shieldConfig = {
                    maxShields: 150,
                    regenRate: 15,
                    regenDelay: 3000,
                    damageReduction: 0.8 // Heavy takes less damage
                };
                break;
            case PlayerClass.SPEEDY:
                this.maxHealth = 75;
                this.shieldConfig = {
                    maxShields: 75,
                    regenRate: 20,
                    regenDelay: 2500,
                    damageReduction: 1.2 // Speedy takes more damage
                };
                break;
            case PlayerClass.ASSAULT:
                this.maxHealth = 100;
                this.shieldConfig = {
                    maxShields: 100,
                    regenRate: 10,
                    regenDelay: 3000,
                    damageReduction: 1
                };
                break;
            case PlayerClass.ENGINEER:
                this.maxHealth = 125;
                this.shieldConfig = {
                    maxShields: 125,
                    regenRate: 12,
                    regenDelay: 2800,
                    damageReduction: 0.9 // Engineer takes slightly less damage
                };
                break;
        }
        
        this.health = this.maxHealth;
        this.shield = new Shield(scene, this, this.shieldConfig);
        this.initWeapon();
        
        // Update UI with initial values
        if ((scene as any).ui) {
            (scene as any).ui.updateHealth(this.health, this.maxHealth);
            (scene as any).ui.updateShield(this.shield.getCurrentShields(), this.shield.getMaxShields());
        }

        // Set up mouse input for shooting
        scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.isDead) {
                const worldPoint = pointer.positionToCamera(scene.cameras.main) as Phaser.Math.Vector2;
                this.shoot(worldPoint.x, worldPoint.y);
            }
        });
    }

    public getClass(): PlayerClass {
        return this.playerClass;
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
            default:
                this.weapon = new AssaultRifle(this.scene, this);
        }
    }

    public takeDamage(amount: number): void {
        if (this.isDead) return;

        // Let shield handle the damage first
        const remainingDamage = this.shield.takeDamage(amount);
        
        // Any remaining damage goes to health
        if (remainingDamage > 0) {
            super.takeDamage(remainingDamage);
        }
        
        // Update UI
        if (this.scene instanceof MainScene && (this.scene as any).ui) {
            (this.scene as any).ui.updateHealth(this.health);
            (this.scene as any).ui.updateShield();
        }
    }

    update(time: number): void {
        super.update(time);
        
        if (!this.isDead && this.cursors) {
            // Handle movement
            let velocityX = 0;
            let velocityY = 0;

            if (this.cursors.left.isDown) {
                velocityX = -this.speed;
            } else if (this.cursors.right.isDown) {
                velocityX = this.speed;
            }

            if (this.cursors.up.isDown) {
                velocityY = -this.speed;
            } else if (this.cursors.down.isDown) {
                velocityY = this.speed;
            }

            // Normalize diagonal movement
            if (velocityX !== 0 && velocityY !== 0) {
                const normalizer = Math.sqrt(2) / 2;
                velocityX *= normalizer;
                velocityY *= normalizer;
            }

            this.setVelocity(velocityX, velocityY);

            // Rotate player to face mouse cursor
            if (this.mousePointer && this.scene) {
                const worldPoint = this.mousePointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
                const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
                this.setRotation(angle);
            }

            // Auto-shoot if mouse is held down
            if (this.mousePointer.isDown) {
                const worldPoint = this.mousePointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
                this.shoot(worldPoint.x, worldPoint.y);
            }
        }
        
        // Update shield
        this.shield.update(time);
        
        // Update UI with shield status
        if (this.scene instanceof MainScene && (this.scene as any).ui) {
            (this.scene as any).ui.updateShield();
        }
    }
} 