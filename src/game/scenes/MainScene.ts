import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy, EnemyType } from '../entities/Enemy';
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
    private characterLevel: number = 1;
    private characterExperience: number = 0;
    private experienceToNextLevel: number = 100;
    private nextDamageTime: number = 0;
    private damageInterval: number = 1000; // 1 second between damage tests
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private waveText: Phaser.GameObjects.Text;
    
    // World bounds
    private readonly WORLD_WIDTH = 2400;
    private readonly WORLD_HEIGHT = 1800;
    private worldBounds!: Phaser.GameObjects.Graphics;

    // Add method to get friendly units
    public getFriendlyUnits(): BaseUnit[] {
        return this.friendlyUnits;
    }

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
        // Set up the world bounds
        this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        
        // Create a visual boundary
        this.createWorldBoundary();
        
        // Initialize player in the center of the world
        this.player = new Player(this, this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2);
        
        // Set up camera
        this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.0); // Adjust this value to change zoom level
        
        // Initialize UI
        this.ui = new UI(this);
        
        // Create test units near the player
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
            this.handleBulletEnemyCollision,
            undefined,
            this
        );

        // Set up collisions with world bounds
        this.player.setCollideWorldBounds(true);
        this.enemies.forEach(enemy => enemy.setCollideWorldBounds(true));
        this.friendlyUnits.forEach(unit => unit.setCollideWorldBounds(true));

        // Set up collision between enemies and player/friendly units
        this.physics.add.overlap(
            this.enemies,
            this.player,
            (enemyObj: any, playerObj: any) => {
                this.handleEnemyCollision(enemyObj as Enemy, playerObj as Player);
            },
            undefined,
            this
        );

        // Add collision between enemies and friendly units
        this.physics.add.overlap(
            this.enemies,
            this.friendlyUnits,
            (enemyObj: any, unitObj: any) => {
                this.handleEnemyCollision(enemyObj as Enemy, unitObj as BaseUnit);
            },
            undefined,
            this
        );

        // Add wave text
        this.waveText = this.add.text(16, 16, `Wave: ${this.wave}`, {
            fontSize: '32px',
            color: '#fff'
        });
    }

    private createWorldBoundary() {
        // Create a graphics object for the world boundary
        this.worldBounds = this.add.graphics();
        
        // Style for the boundary
        this.worldBounds.lineStyle(4, 0x00ff00, 0.8); // Green border
        
        // Draw the rectangle
        this.worldBounds.strokeRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        
        // Add some grid lines for reference
        this.worldBounds.lineStyle(1, 0x00ff00, 0.3);
        
        // Vertical lines
        for (let x = 0; x < this.WORLD_WIDTH; x += 200) {
            this.worldBounds.lineBetween(x, 0, x, this.WORLD_HEIGHT);
        }
        
        // Horizontal lines
        for (let y = 0; y < this.WORLD_HEIGHT; y += 200) {
            this.worldBounds.lineBetween(0, y, this.WORLD_WIDTH, y);
        }
    }

    private handleBulletEnemyCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject): void {
        console.log('Collision detected between:', obj1, obj2);
        
        // Determine which object is the bullet and which is the enemy
        let bullet: Bullet | null = null;
        let enemy: Enemy | null = null;

        if (obj1 instanceof Bullet && obj2 instanceof Enemy) {
            bullet = obj1;
            enemy = obj2;
        } else if (obj1 instanceof Enemy && obj2 instanceof Bullet) {
            bullet = obj2;
            enemy = obj1;
        }

        // If we couldn't identify the objects, or either is inactive, return
        if (!bullet?.active || !enemy?.active) {
            console.log('Bullet or enemy is inactive or not properly identified');
            return;
        }

        console.log('Applying damage to enemy');
        
        try {
            // Apply damage and deactivate bullet
            const damage = bullet.getDamage();
            enemy.takeDamage(damage);
            bullet.setActive(false);
            bullet.setVisible(false);
        } catch (error) {
            console.error('Error in bullet-enemy collision:', error);
        }
    }

    private handleEnemyCollision(enemy: Enemy, target: Player | BaseUnit) {
        if (!enemy.active || !target.active) return;
        
        // Check if enough time has passed since last damage
        const now = this.time.now;
        if (!enemy.lastDamageTime || now > enemy.lastDamageTime + enemy.damageInterval) {
            // Apply damage to target
            const damage = enemy.getDamageAmount();
            target.takeDamage(damage);
            
            // Update UI if player was damaged
            if (target instanceof Player) {
                this.ui.updateHealth(target.getHealth());
            }
            
            // Update last damage time
            enemy.lastDamageTime = now;
            
            // Visual feedback
            target.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                if (target.active) {
                    target.clearTint();
                }
            });
        }
    }

    private spawnWave(): void {
        const numEnemies = Math.min(5 + this.wave * 2, 20);
        
        for (let i = 0; i < numEnemies; i++) {
            const spawnPoint = this.getRandomSpawnPoint();
            
            // Determine enemy type based on wave and random chance
            let enemyType: EnemyType;
            const rand = Math.random();
            
            if (this.wave < 3) {
                // Early waves: mostly normal enemies, some fast ones
                enemyType = rand < 0.7 ? EnemyType.NORMAL : EnemyType.FAST;
            } else if (this.wave < 5) {
                // Mid waves: mix of all types
                if (rand < 0.4) enemyType = EnemyType.NORMAL;
                else if (rand < 0.7) enemyType = EnemyType.FAST;
                else enemyType = EnemyType.HEAVY;
            } else {
                // Later waves: more heavy enemies
                if (rand < 0.3) enemyType = EnemyType.NORMAL;
                else if (rand < 0.6) enemyType = EnemyType.FAST;
                else enemyType = EnemyType.HEAVY;
            }

            const enemy = new Enemy(this, spawnPoint.x, spawnPoint.y, this.wave, enemyType);
            enemy.init();
            this.enemies.push(enemy);
        }

        this.wave++;
        this.ui.updateGameLevel(this.wave);
    }

    private createTestUnits() {
        // Create units around the player's starting position
        const centerX = this.WORLD_WIDTH / 2;
        const centerY = this.WORLD_HEIGHT / 2;
        
        this.friendlyUnits.push(
            new HeavyShieldUnit(this, centerX - 100, centerY - 100),
            new SpeedyLightUnit(this, centerX + 100, centerY - 100),
            new AssaultMarine(this, centerX - 100, centerY + 100),
            new SupportEngineer(this, centerX + 100, centerY + 100)
        );
        
        // Make sure units stay within world bounds
        this.friendlyUnits.forEach(unit => unit.setCollideWorldBounds(true));
    }

    update(time: number) {
        if (!this.player.active) return;

        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        this.friendlyUnits.forEach(unit => unit.update(time));
        
        // Check if wave is completed
        if (this.enemies.length === 0) {
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

    public addExperience(amount: number): void {
        this.characterExperience += amount;
        
        // Check for level up
        while (this.characterExperience >= this.experienceToNextLevel) {
            this.characterExperience -= this.experienceToNextLevel;
            this.characterLevel++;
            this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
            
            // Update UI
            this.ui.updateCharacterLevel(this.characterLevel);
            
            // Could add level up effects here
            const levelUpText = this.add.text(this.player.x, this.player.y - 50, 'Level Up!', {
                fontSize: '32px',
                color: '#ffff00'
            });
            
            this.tweens.add({
                targets: levelUpText,
                y: levelUpText.y - 100,
                alpha: 0,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => levelUpText.destroy()
            });
        }
    }

    public removeEnemy(enemy: Enemy): void {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            this.addExperience(enemy.getExperienceValue());
        }
    }

    private getRandomSpawnPoint(): { x: number, y: number } {
        // Randomly choose which edge to spawn on (0: top, 1: right, 2: bottom, 3: left)
        const edge = Phaser.Math.Between(0, 3);
        let x: number;
        let y: number;

        switch (edge) {
            case 0: // Top
                x = Phaser.Math.Between(0, this.WORLD_WIDTH);
                y = -20;
                break;
            case 1: // Right
                x = this.WORLD_WIDTH + 20;
                y = Phaser.Math.Between(0, this.WORLD_HEIGHT);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(0, this.WORLD_WIDTH);
                y = this.WORLD_HEIGHT + 20;
                break;
            case 3: // Left
                x = -20;
                y = Phaser.Math.Between(0, this.WORLD_HEIGHT);
                break;
            default:
                x = -20;
                y = -20;
        }

        return { x, y };
    }
} 