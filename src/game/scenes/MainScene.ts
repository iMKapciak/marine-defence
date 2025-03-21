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
import { Minimap } from '../ui/Minimap';
import { Dogtag } from '../entities/Dogtag';
import { PlayerData, PlayerClass } from '../types/PlayerData';
import { socket } from '../../services/socket';

export default class MainScene extends Phaser.Scene {
    public player!: Player;
    private enemies: Enemy[] = [];
    private friendlyUnits: BaseUnit[] = [];
    private ui!: UI;
    private minimap!: Minimap;
    private wave: number = 1;
    private characterLevel: number = 1;
    private characterExperience: number = 0;
    private experienceToNextLevel: number = 100;
    private nextDamageTime: number = 0;
    private damageInterval: number = 1000; // 1 second between damage tests
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private waveText!: Phaser.GameObjects.Text;
    
    // World bounds
    private readonly WORLD_WIDTH = 2400;
    private readonly WORLD_HEIGHT = 1800;
    private worldBounds!: Phaser.GameObjects.Graphics;

    private dogtags!: Phaser.Physics.Arcade.Group;
    private respawningUnits: Map<BaseUnit, number> = new Map();
    private selectedPlayers: PlayerData[] = [];
    private localPlayerId: string = '';

    // Add getters for minimap
    public getWorldWidth(): number {
        return this.WORLD_WIDTH;
    }

    public getWorldHeight(): number {
        return this.WORLD_HEIGHT;
    }

    public getPlayer(): Player {
        return this.player;
    }

    public getEnemies(): Enemy[] {
        return this.enemies;
    }

    // Add method to get friendly units
    public getFriendlyUnits(): BaseUnit[] {
        return this.friendlyUnits;
    }

    constructor() {
        super({ key: 'MainScene' });
    }

    init(data: { players: PlayerData[] }) {
        console.log('Initializing MainScene with data:', data);
        
        // Validate data
        if (!data || !data.players || data.players.length === 0) {
            console.error('Invalid or missing player data');
            return;
        }

        // Store selected players data
        this.selectedPlayers = data.players;
        
        // Store local player ID (first player is always local in single player)
        this.localPlayerId = data.players[0].id;
        
        console.log('Selected players:', this.selectedPlayers);
        console.log('Local player ID:', this.localPlayerId);
    }

    preload() {
        // Create dynamic assets
        this.createPlayerTexture();
        this.createEnemyTexture();
        this.createBulletTexture();
        this.createUnitTextures();
        
        // Load avatar images
        this.load.image('heavy_avatar', 'assets/avatars/heavy.png');
        this.load.image('light_avatar', 'assets/avatars/light_avatar.png');
        this.load.image('assault_avatar', 'assets/avatars/assault.png');
        this.load.image('engineer_avatar', 'assets/avatars/engineer.png');
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
        graphics.arc(4, 4, 3, 0, Math.PI * 2);
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
        this.worldBounds = this.add.graphics();
        this.worldBounds.lineStyle(2, 0x00ff00);
        this.worldBounds.strokeRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Set up physics world bounds
        this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Set up camera
        this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Create test units (including player) first
        this.createTestUnits();

        // Initialize UI after player is created
        if (!this.player) {
            console.error('Cannot initialize UI: Player not created');
            return;
        }
        this.ui = new UI(this, this.player);

        // Initialize minimap after UI
        this.minimap = new Minimap(this);

        // Create dogtags group
        this.dogtags = this.physics.add.group({
            classType: Dogtag,
            runChildUpdate: true
        });

        // Listen for attribute upgrades
        socket.on('player:attributeUpgraded', (data: { attribute: string, newValue: number }) => {
            console.log('[MainScene] Received attribute upgrade:', data);
            
            // Get current attributes from registry or initialize new object
            const attributes = this.game.registry.get('playerAttributes') || {};
            
            // Update the specific attribute
            attributes[data.attribute] = data.newValue;
            
            // Store updated attributes back in registry
            this.game.registry.set('playerAttributes', attributes);
            
            // Update player if it exists
            if (this.player) {
                this.player.handleAttributeUpgrade(data.attribute, data.newValue);
            }
        });

        // Set up collision between bullets and enemies only if player exists
        if (this.player && this.player.getWeapon()) {
            const bullets = this.player.getWeapon().getBullets();
            if (bullets) {
                this.physics.add.overlap(
                    bullets,
                    this.enemies,
                    (obj1, obj2) => {
                        const gameObj1 = (obj1 as Phaser.GameObjects.GameObject);
                        const gameObj2 = (obj2 as Phaser.GameObjects.GameObject);
                        
                        if (gameObj1 instanceof Bullet && gameObj2 instanceof Enemy) {
                            this.handleBulletEnemyCollision(gameObj1, gameObj2);
                        } else if (gameObj1 instanceof Enemy && gameObj2 instanceof Bullet) {
                            this.handleBulletEnemyCollision(gameObj2, gameObj1);
                        }
                    },
                    undefined,
                    this
                );
            }
        }

        // Start spawning enemies
        this.spawnWave();

        // Add test key for damage
        if (this.input.keyboard) {
            this.spaceKey = this.input.keyboard.addKey('SPACE');
            this.spaceKey.on('down', () => {
                if (this.player) {
                    this.player.takeDamage(20);
                    this.ui.updateHealth(this.player.getHealth());
                }
            });
        }

        // Set up collision between enemies and player/friendly units
        if (this.player) {
            this.physics.add.overlap(
                this.enemies,
                this.player,
                (obj1, obj2) => {
                    const gameObj1 = (obj1 as Phaser.GameObjects.GameObject);
                    const gameObj2 = (obj2 as Phaser.GameObjects.GameObject);
                    
                    if (gameObj1 instanceof Enemy && gameObj2 instanceof Player) {
                        this.handleEnemyCollision(gameObj1, gameObj2);
                    }
                },
                undefined,
                this
            );
        }

        // Add wave text
        this.waveText = this.add.text(16, 16, `Wave: ${this.wave}`, {
            fontSize: '32px',
            color: '#fff'
        });

        // Add collision between player and dogtags
        if (this.player) {
            this.physics.add.overlap(
                this.player,
                this.dogtags,
                (player, dogtag) => {
                    if (dogtag instanceof Dogtag) {
                        dogtag.collect();
                    }
                },
                undefined,
                this
            );
        }
    }

    private handleBulletEnemyCollision(bullet: Bullet, enemy: Enemy): void {
        if (!bullet?.active || !enemy?.active) {
            console.log('[MainScene] Bullet or enemy is inactive');
            return;
        }

        console.log('[MainScene] Handling bullet-enemy collision');
        
        try {
            const damage = bullet.getDamage();
            const sourceWeapon = bullet.getSourceWeapon();
            console.log('[MainScene] Bullet damage:', damage, 'from weapon:', sourceWeapon?.constructor.name);
            
            enemy.takeDamage(damage);
            bullet.setActive(false);
            bullet.setVisible(false);
        } catch (error) {
            console.error('[MainScene] Error in bullet-enemy collision:', error);
        }
    }

    private handleEnemyCollision(enemy: Enemy, target: BaseUnit | Player) {
        const now = this.time.now;
        if (now < enemy.lastDamageTime + enemy.damageInterval) return;

        enemy.lastDamageTime = now;
        target.takeDamage(enemy.getDamageAmount());

        // Update UI if player was damaged
        if (target instanceof Player) {
            this.ui.updateHealth(target.getHealth());
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
        // Get center position
        const centerX = this.WORLD_WIDTH / 2;
        const centerY = this.WORLD_HEIGHT / 2;
        
        // Ensure we have selected players
        if (!this.selectedPlayers || this.selectedPlayers.length === 0) {
            console.error('No players selected');
            return;
        }

        // Create units based on player selections
        this.selectedPlayers.forEach((playerData, index) => {
            let unit: BaseUnit;
            const offset = 100; // Space between units
            const angle = (index / this.selectedPlayers.length) * Math.PI * 2; // Distribute units in a circle
            const x = centerX + Math.cos(angle) * offset;
            const y = centerY + Math.sin(angle) * offset;

            // If this is the local player, create a Player instance
            if (playerData.id === this.localPlayerId) {
                console.log('Creating player with class:', playerData.class);
                this.player = new Player(this, x, y, playerData.class);
                this.player.setActive(true);
                this.player.setVisible(true);
                this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
                this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
                this.cameras.main.setZoom(1.0);
                console.log('Player initialized:', {
                    active: this.player.active,
                    visible: this.player.visible,
                    x: this.player.x,
                    y: this.player.y,
                    class: playerData.class
                });
                return;
            }

            switch (playerData.class) {
                case PlayerClass.HEAVY:
                    unit = new HeavyShieldUnit(this, x, y);
                    break;
                case PlayerClass.SPEEDY:
                    unit = new SpeedyLightUnit(this, x, y);
                    break;
                case PlayerClass.ASSAULT:
                    unit = new AssaultMarine(this, x, y);
                    break;
                case PlayerClass.ENGINEER:
                    unit = new SupportEngineer(this, x, y);
                    break;
                default:
                    console.warn(`Unknown player class: ${playerData.class}`);
                    return;
            }

            // Add unit to friendly units array
            this.friendlyUnits.push(unit);
            
            // Make sure unit stays within world bounds
            unit.setCollideWorldBounds(true);
        });

        // Log player creation status
        if (!this.player) {
            console.error('Player was not created');
        } else {
            console.log('Player created successfully');
        }
    }

    update(time: number) {
        // Check if player exists and is properly initialized
        if (!this.player) {
            console.warn('Player not yet initialized');
            return;
        }

        // Check if player is dead
        if (!this.player.active && this.player.scene === this) {
            console.log('Player died:', {
                playerActive: this.player.active,
                playerHealth: this.player.getHealth()
            });
            
            // Check if all friendly units are also dead and no respawns are pending
            const allUnitsDead = this.friendlyUnits.every(unit => !unit.active);
            const hasActiveDogtags = this.dogtags.getChildren().length > 0;
            
            // Only trigger game over if both player and all units are dead AND there are no dogtags
            if (allUnitsDead && !hasActiveDogtags) {
                console.log('Game over condition met - all units dead and no dogtags');
                this.gameOver();
                return;
            }
        }

        // Rest of update logic
        this.player.update(time);
        this.enemies.forEach(enemy => enemy.update());
        this.friendlyUnits.forEach(unit => unit.update(time));
        
        // Update UI
        this.ui.update();
        
        // Update minimap
        this.minimap.update();
        
        // Check if wave is completed
        if (this.enemies.length === 0) {
            this.spawnWave();
        }
    }

    public addExperience(amount: number): void {
        this.characterExperience += amount;
        
        // Check for level up
        while (this.characterExperience >= this.experienceToNextLevel) {
            this.characterExperience -= this.experienceToNextLevel;
            this.characterLevel++;
            
            // Increase experience required for next level
            this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
            
            console.log('[MainScene] Level up! New level:', this.characterLevel);
            
            // Start the LevelingScene
            if (!this.scene.isActive('LevelingScene')) {
                console.log('[MainScene] Starting LevelingScene');
                this.scene.launch('LevelingScene');
                this.scene.bringToTop('LevelingScene');
            }
        }

        // Update UI
        if (this.ui) {
            this.ui.updateExperience(this.characterExperience, this.experienceToNextLevel);
            this.ui.updateLevel(this.characterLevel);
        }
    }

    public removeEnemy(enemy: Enemy): void {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            
            // Add experience when enemy is killed
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

    public respawnUnit(unit: BaseUnit, x: number, y: number): void {
        console.log('MainScene: Respawning unit', { x, y });
        
        // Ensure the unit is in our friendlyUnits array
        if (!this.friendlyUnits.includes(unit)) {
            console.error('Unit not found in friendlyUnits array');
            return;
        }

        // Call the unit's respawn method
        unit.respawn(x, y);
        console.log('Unit respawned successfully');
    }

    private cleanup(): void {
        try {
            // Stop all updates first
            if (this.physics && this.physics.pause) {
                this.physics.pause();
            }

            if (this.time && this.time.removeAllEvents) {
                this.time.removeAllEvents();
            }

            if (this.tweens && this.tweens.killAll) {
                this.tweens.killAll();
            }

            // Clear arrays safely
            if (this.enemies) {
                this.enemies.forEach(enemy => {
                    if (enemy && enemy.destroy) {
                        enemy.destroy();
                    }
                });
                this.enemies = [];
            }

            if (this.friendlyUnits) {
                this.friendlyUnits.forEach(unit => {
                    if (unit && unit.destroy) {
                        unit.destroy();
                    }
                });
                this.friendlyUnits = [];
            }

            // Clear dogtags group safely
            if (this.dogtags && this.dogtags.clear) {
                this.dogtags.clear(true, true);
            }

            // Hide UI elements
            if (this.ui && this.ui.cleanup) {
                try {
                    this.ui.cleanup();
                } catch (e) {
                    console.warn('Error cleaning up UI:', e);
                }
            }

            // Hide wave text
            if (this.waveText && this.waveText.active) {
                try {
                    this.waveText.destroy();
                } catch (e) {
                    console.warn('Error destroying wave text:', e);
                }
            }

            // Clear graphics
            if (this.worldBounds && this.worldBounds.active) {
                try {
                    this.worldBounds.destroy();
                } catch (e) {
                    console.warn('Error destroying world bounds:', e);
                }
            }

            // Clean up player
            if (this.player && this.player.destroy) {
                try {
                    this.player.destroy();
                } catch (e) {
                    console.warn('Error destroying player:', e);
                }
            }

            // Clean up minimap
            if (this.minimap && this.minimap.destroy) {
                try {
                    this.minimap.destroy();
                } catch (e) {
                    console.warn('Error destroying minimap:', e);
                }
            }

        } catch (error) {
            console.warn('Error during scene cleanup:', error);
        }
    }

    private gameOver(): void {
        try {
            // Stop all updates and physics
            this.physics.pause();

            // Show game over text
            const gameOverText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                'GAME OVER\nClick to restart',
                {
                    fontSize: '48px',
                    color: '#ff0000',
                    align: 'center'
                }
            ).setOrigin(0.5);

            // Make text fixed to camera
            gameOverText.setScrollFactor(0);

            // Add click handler to restart
            this.input.once('pointerdown', () => {
                try {
                    // Just restart the scene, let Phaser handle cleanup
                    this.scene.restart();
                } catch (error) {
                    console.warn('Error during game restart:', error);
                    // Force a hard restart if cleanup fails
                    window.location.reload();
                }
            });
        } catch (error) {
            console.warn('Error during game over:', error);
        }
    }

    // Override scene's shutdown method
    shutdown(): void {
        try {
            // Do cleanup first
            this.cleanup();
        } catch (error) {
            console.warn('Error during scene shutdown:', error);
        }
    }

    // Override scene's destroy method
    destroy(): void {
        try {
            // Do cleanup first
            this.cleanup();
        } catch (error) {
            console.warn('Error during scene destroy:', error);
        }
    }

    public addDogtag(dogtag: Dogtag): void {
        this.dogtags.add(dogtag);
    }
} 