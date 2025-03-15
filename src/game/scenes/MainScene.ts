import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { UI } from '../ui/UI';

export default class MainScene extends Phaser.Scene {
    private player!: Player;
    private enemies: Enemy[] = [];
    private ui!: UI;
    private wave: number = 1;
    private experience: number = 0;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Load assets
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('bullet', 'assets/bullet.png');
    }

    create() {
        // Initialize player
        this.player = new Player(this, 400, 300);
        
        // Initialize UI
        this.ui = new UI(this);
        
        // Start spawning enemies
        this.spawnWave();
    }

    update() {
        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        
        // Check if wave is completed
        if (this.enemies.length === 0) {
            this.wave++;
            this.spawnWave();
        }
    }

    private spawnWave() {
        const enemyCount = this.wave * 2;
        for (let i = 0; i < enemyCount; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const enemy = new Enemy(this, x, y, this.wave);
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
} 