import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { UI } from '../ui/UI';
import { BaseUnit } from '../entities/units/BaseUnit';
import { HeavyShieldUnit } from '../entities/units/HeavyShieldUnit';
import { SpeedyLightUnit } from '../entities/units/SpeedyLightUnit';
import { AssaultMarine } from '../entities/units/AssaultMarine';
import { SupportEngineer } from '../entities/units/SupportEngineer';
import { Bullet } from '../entities/Bullet';

export default class MainScene extends Phaser.Scene {
    public player!: Player;
    private enemies: Enemy[] = [];
    private friendlyUnits: BaseUnit[] = [];
    private ui!: UI;
    private wave: number = 1;
    private experience: number = 0;
    private nextDamageTime: number = 0;
    private damageInterval: number = 1000; // 1 second between damage tests
    private spaceKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Create dynamic assets
        this.createPlayerTexture();
        this.createEnemyTexture();
        this.createBulletTexture();
        this.createUnitTextures();
    }

    private createPlayerTexture() {
        // Create a triangle for the player
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x00ff00);
        graphics.fillStyle(0x00ff00);
        graphics.beginPath();
        graphics.moveTo(0, -15);
        graphics.lineTo(15, 15);
        graphics.lineTo(-15, 15);
        graphics.closePath();
        graphics.fill();
        graphics.stroke();
        
        graphics.generateTexture('player', 32, 32);
        graphics.destroy();
    }

    private createEnemyTexture() {
        // Create a red circle for enemies
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xff0000);
        graphics.fillStyle(0xff0000);
        graphics.beginPath();
        graphics.arc(0, 0, 10, 0, Math.PI * 2);
        graphics.closePath();
        graphics.fill();
        graphics.stroke();
        
        graphics.generateTexture('enemy', 32, 32);
        graphics.destroy();
    }

    private createBulletTexture() {
        // Create a small yellow circle for bullets
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0xffff00);
        graphics.fillStyle(0xffff00);
        graphics.beginPath();
        graphics.arc(0, 0, 3, 0, Math.PI * 2);
        graphics.closePath();
        graphics.fill();
        graphics.stroke();
        
        graphics.generateTexture('bullet', 8, 8);
        graphics.destroy();
    }

    private createUnitTextures() {
        // Heavy Shield Unit (Blue Square)
        const heavyGraphics = this.add.graphics();
        heavyGraphics.lineStyle(2, 0x0000ff);
        heavyGraphics.fillStyle(0x0000ff);
        heavyGraphics.fillRect(-12, -12, 24, 24);
        heavyGraphics.generateTexture('heavyUnit', 32, 32);
        heavyGraphics.destroy();

        // Speedy Light Unit (Yellow Triangle)
        const speedyGraphics = this.add.graphics();
        speedyGraphics.lineStyle(2, 0xffff00);
        speedyGraphics.fillStyle(0xffff00);
        speedyGraphics.beginPath();
        speedyGraphics.moveTo(0, -15);
        speedyGraphics.lineTo(10, 10);
        speedyGraphics.lineTo(-10, 10);
        speedyGraphics.closePath();
        speedyGraphics.fill();
        speedyGraphics.stroke();
        speedyGraphics.generateTexture('speedyUnit', 32, 32);
        speedyGraphics.destroy();

        // Assault Marine (Green Diamond)
        const marineGraphics = this.add.graphics();
        marineGraphics.lineStyle(2, 0x00ff00);
        marineGraphics.fillStyle(0x00ff00);
        marineGraphics.beginPath();
        marineGraphics.moveTo(0, -15);
        marineGraphics.lineTo(15, 0);
        marineGraphics.lineTo(0, 15);
        marineGraphics.lineTo(-15, 0);
        marineGraphics.closePath();
        marineGraphics.fill();
        marineGraphics.stroke();
        marineGraphics.generateTexture('marineUnit', 32, 32);
        marineGraphics.destroy();

        // Support Engineer (Cyan Pentagon)
        const engineerGraphics = this.add.graphics();
        engineerGraphics.lineStyle(2, 0x00ffff);
        engineerGraphics.fillStyle(0x00ffff);
        engineerGraphics.beginPath();
        engineerGraphics.moveTo(0, -15);
        engineerGraphics.lineTo(14, -5);
        engineerGraphics.lineTo(9, 12);
        engineerGraphics.lineTo(-9, 12);
        engineerGraphics.lineTo(-14, -5);
        engineerGraphics.closePath();
        engineerGraphics.fill();
        engineerGraphics.stroke();
        engineerGraphics.generateTexture('engineerUnit', 32, 32);
        engineerGraphics.destroy();
    }

    create() {
        // Initialize player
        this.player = new Player(this, 400, 300);
        
        // Initialize UI
        this.ui = new UI(this);
        
        // Create test units
        this.createTestUnits();

        // Start spawning enemies
        this.spawnWave();

        // Add test key for damage
        if (this.input.keyboard) {
            this.spaceKey = this.input.keyboard.addKey('SPACE');
            this.spaceKey.on('down', () => {
                this.player.takeDamage(20);
                this.ui.updateHealth(this.player.getHealth());
            });
        }

        // Set up collision between bullets and enemies
        this.physics.add.overlap(
            this.player.bullets,
            this.enemies,
            (obj1, obj2) => {
                try {
                    // Make sure we identify bullet and enemy correctly
                    let bullet: Bullet;
                    let enemy: Enemy;
                    
                    // Determine which object is the bullet and which is the enemy
                    if (obj1 instanceof Bullet) {
                        bullet = obj1;
                        enemy = obj2 as Enemy;
                    } else {
                        bullet = obj2 as Bullet;
                        enemy = obj1 as Enemy;
                    }
                    
                    if (!enemy || !bullet || !enemy.active || !bullet.active) return;
                    
                    // Get damage from bullet
                    const damage = bullet.damage || 20; // Fallback to 20 if damage property is undefined
                    console.log(`Bullet hit enemy with damage: ${damage}`);
                    
                    // Apply damage to enemy
                    enemy.takeDamage(damage);
                    
                    // Destroy the bullet
                    bullet.destroy();
                } catch (error) {
                    console.error('Error in bullet-enemy collision:', error);
                }
            },
            undefined,
            this
        );
    }

    private createTestUnits() {
        // Create one of each unit type for testing
        this.friendlyUnits.push(
            new HeavyShieldUnit(this, 300, 200),
            new SpeedyLightUnit(this, 500, 200),
            new AssaultMarine(this, 300, 400),
            new SupportEngineer(this, 500, 400)
        );
    }

    update(time: number) {
        if (!this.player.active) return;

        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        this.friendlyUnits.forEach(unit => unit.update(time));
        
        // Check if wave is completed
        if (this.enemies.length === 0) {
            this.wave++;
            this.spawnWave();
        }

        // Automatically regenerate shield
        if (time > this.nextDamageTime) {
            // Apply small damage for testing
            if (Math.random() < 0.3) { // 30% chance to take damage
                this.player.takeDamage(10);
                this.ui.updateHealth(this.player.getHealth());
            }
            this.nextDamageTime = time + this.damageInterval;
        }
    }

    private spawnWave() {
        const enemyCount = this.wave * 2;
        for (let i = 0; i < enemyCount; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const enemy = new Enemy(this, x, y, this.wave);
            // Ensure enemy is properly added to the scene and physics system
            this.add.existing(enemy);
            this.physics.add.existing(enemy);
            enemy.setCircle(10);
            this.enemies.push(enemy);
        }
    }

    public addExperience(amount: number) {
        this.experience += amount;
        this.ui.updateExperience(this.experience);
    }

    public removeEnemy(enemy: Enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            this.addExperience(enemy.getExperienceValue());
        }
    }

    public getFriendlyUnits(): BaseUnit[] {
        return this.friendlyUnits;
    }
} 