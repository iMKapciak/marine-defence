import { Scene } from 'phaser';
import { PlayerClass } from '../types/PlayerData';
import { Weapon, WeaponStats } from '../weapons/Weapon';
import { AssaultRifle } from '../weapons/AssaultRifle';
import { SMG } from '../weapons/SMG';
import { Shotgun } from '../weapons/Shotgun';
import { Pistol } from '../weapons/Pistol';
import { BaseUnit } from './units/BaseUnit';
import { Shield, ShieldConfig } from './Shield';
import MainScene from '../scenes/MainScene';
import { socket } from '../../services/socket';

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
    private wasdKeys!: {
        W: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };

    constructor(scene: MainScene, x: number, y: number, playerClass: PlayerClass) {
        super(scene, x, y, 'player');
        this.playerClass = playerClass;
        
        // Set up input
        if (scene.input && scene.input.keyboard) {
            this.wasdKeys = {
                W: scene.input.keyboard.addKey('W'),
                S: scene.input.keyboard.addKey('S'),
                A: scene.input.keyboard.addKey('A'),
                D: scene.input.keyboard.addKey('D')
            };
        }

        this.mousePointer = scene.input.activePointer;
        
        // Set up class-specific attributes
        switch (playerClass) {
            case PlayerClass.HEAVY:
                this.maxHealth = 200;
                this.shieldConfig = {
                    maxShields: 150,
                    regenRate: 8,
                    regenDelay: 3500,
                    damageReduction: 0.8 // Heavy takes 20% less damage
                };
                break;
            case PlayerClass.SPEEDY:
                this.maxHealth = 100;
                this.shieldConfig = {
                    maxShields: 75,
                    regenRate: 15,
                    regenDelay: 2500,
                    damageReduction: 1
                };
                break;
            case PlayerClass.ASSAULT:
                this.maxHealth = 150;
                this.shieldConfig = {
                    maxShields: 100,
                    regenRate: 10,
                    regenDelay: 3000,
                    damageReduction: 0.9 // Assault takes 10% less damage
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

        // Initialize weapon first
        this.initWeapon();

        // Get current weapon stats
        const currentWeaponStats = this.weapon?.getStats() || this.getDefaultWeaponStats();
        console.log('[Player] Current weapon stats:', currentWeaponStats);

        // Store initial attributes in registry based on current weapon stats
        scene.game.registry.set('playerAttributes', {
            damagePerShot: currentWeaponStats.damage,
            fireRate: 1000 / currentWeaponStats.fireRate, // Convert from ms between shots to shots per second
            movementSpeed: this.speed / 20, // Convert from game units to attribute units
            shieldAmount: this.shieldConfig.maxShields
        });
        
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

        // Listen for attribute upgrades
        socket.on('player:attributeUpgraded', (data: { attribute: string, newValue: number }) => {
            console.log('[Player] Attribute upgraded:', data);
            this.handleAttributeUpgrade(data.attribute, data.newValue);
        });
    }

    private getDefaultWeaponStats(): WeaponStats {
        switch (this.playerClass) {
            case PlayerClass.HEAVY:
                return { ...Shotgun.DEFAULT_STATS };
            case PlayerClass.SPEEDY:
                return { ...SMG.DEFAULT_STATS };
            case PlayerClass.ASSAULT:
                return { ...AssaultRifle.DEFAULT_STATS };
            case PlayerClass.ENGINEER:
                return { ...Pistol.DEFAULT_STATS };
            default:
                return { ...AssaultRifle.DEFAULT_STATS };
        }
    }

    public handleAttributeUpgrade(attribute: string, newValue: number): void {
        console.log('[Player] Handling attribute upgrade:', attribute, 'to', newValue);
        this.updateAttributes(attribute, newValue);
    }

    private updateAttributes(attribute: string, newValue: number) {
        console.log('[Player] Updating attribute:', attribute, 'to', newValue);
        switch (attribute) {
            case 'damagePerShot':
                if (this.weapon) {
                    console.log('[Player] Updating weapon damage:', {
                        currentDamage: this.weapon.getDamage(),
                        newDamage: newValue
                    });
                    this.weapon.updateDamage(newValue);
                    // Verify the update
                    const updatedDamage = this.weapon.getDamage();
                    console.log('[Player] Weapon damage after update:', updatedDamage);
                    if (updatedDamage !== newValue) {
                        console.error('[Player] Damage update failed! Expected:', newValue, 'Got:', updatedDamage);
                    }
                } else {
                    console.warn('[Player] No weapon found to update damage');
                }
                break;
            case 'fireRate':
                if (this.weapon) {
                    // Convert fireRate value to milliseconds between shots
                    const fireRateMs = 1000 / newValue;
                    this.weapon.updateFireRate(fireRateMs);
                }
                break;
            case 'movementSpeed':
                this.speed = newValue * 20; // Scale the speed appropriately
                break;
            case 'shieldAmount':
                if (this.shield) {
                    this.shield.updateMaxShields(newValue);
                }
                break;
        }
    }

    public getClass(): PlayerClass {
        return this.playerClass;
    }

    protected initWeapon(): void {
        console.log('[Player] Initializing weapon for class:', this.playerClass);
        
        // Create weapon instance based on class
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

        if (!this.weapon) {
            console.error('[Player] Failed to create weapon');
            return;
        }

        // Get any existing attributes from registry
        const attributes = (this.scene as any).game.registry.get('playerAttributes');
        if (attributes) {
            console.log('[Player] Found existing attributes:', attributes);
            this.weapon.updateDamage(attributes.damagePerShot);
            const fireRateMs = 1000 / attributes.fireRate;
            this.weapon.updateFireRate(fireRateMs);
        }

        console.log('[Player] Weapon initialized with damage:', this.weapon.getDamage());
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
        
        if (!this.isDead && this.wasdKeys) {
            // Handle movement
            let velocityX = 0;
            let velocityY = 0;

            if (this.wasdKeys.A.isDown) {
                velocityX = -this.speed;
            } else if (this.wasdKeys.D.isDown) {
                velocityX = this.speed;
            }

            if (this.wasdKeys.W.isDown) {
                velocityY = -this.speed;
            } else if (this.wasdKeys.S.isDown) {
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