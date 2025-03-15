import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';

export class Minimap {
    private scene: MainScene;
    private minimap: Phaser.GameObjects.Graphics;
    private minimapBorder: Phaser.GameObjects.Graphics;
    private readonly MINIMAP_WIDTH = 200;
    private readonly MINIMAP_HEIGHT = 150;
    private readonly MINIMAP_MARGIN = 10;
    private readonly SCALE_X: number;
    private readonly SCALE_Y: number;
    private isDestroyed: boolean = false;

    constructor(scene: MainScene) {
        this.scene = scene;
        
        // Calculate scale factors
        this.SCALE_X = this.MINIMAP_WIDTH / scene.getWorldWidth();
        this.SCALE_Y = this.MINIMAP_HEIGHT / scene.getWorldHeight();

        // Create minimap border
        this.minimapBorder = scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(100);
            
        // Create minimap
        this.minimap = scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(100);

        // Position minimap in bottom right corner
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        
        this.minimap.x = gameWidth - this.MINIMAP_WIDTH - this.MINIMAP_MARGIN;
        this.minimap.y = gameHeight - this.MINIMAP_HEIGHT - this.MINIMAP_MARGIN;
        
        this.minimapBorder.x = this.minimap.x;
        this.minimapBorder.y = this.minimap.y;

        // Draw border
        this.drawBorder();
    }

    private drawBorder(): void {
        if (this.isDestroyed) return;
        this.minimapBorder.clear();
        this.minimapBorder.lineStyle(2, 0xffffff, 0.8);
        this.minimapBorder.strokeRect(0, 0, this.MINIMAP_WIDTH, this.MINIMAP_HEIGHT);
    }

    public update(): void {
        if (this.isDestroyed) return;
        
        try {
            this.minimap.clear();

            // Draw background
            this.minimap.fillStyle(0x000000, 0.5);
            this.minimap.fillRect(0, 0, this.MINIMAP_WIDTH, this.MINIMAP_HEIGHT);

            // Draw player (green triangle)
            const player = this.scene.getPlayer();
            if (player && player.active) {
                const playerX = player.x * this.SCALE_X;
                const playerY = player.y * this.SCALE_Y;
                this.minimap.fillStyle(0x00ff00);
                this.drawTriangle(playerX, playerY, 4);
            }

            // Draw friendly units (blue dots)
            const friendlyUnits = this.scene.getFriendlyUnits();
            if (friendlyUnits) {
                friendlyUnits.forEach(unit => {
                    if (unit && unit.active) {
                        this.minimap.fillStyle(0x0000ff);
                        this.minimap.fillCircle(
                            unit.x * this.SCALE_X,
                            unit.y * this.SCALE_Y,
                            2
                        );
                    }
                });
            }

            // Draw enemies (red dots)
            const enemies = this.scene.getEnemies();
            if (enemies) {
                enemies.forEach(enemy => {
                    if (enemy && enemy.active) {
                        this.minimap.fillStyle(0xff0000);
                        this.minimap.fillCircle(
                            enemy.x * this.SCALE_X,
                            enemy.y * this.SCALE_Y,
                            2
                        );
                    }
                });
            }
        } catch (error) {
            console.warn('Error updating minimap:', error);
        }
    }

    private drawTriangle(x: number, y: number, size: number): void {
        if (this.isDestroyed) return;
        this.minimap.beginPath();
        this.minimap.moveTo(x, y - size);
        this.minimap.lineTo(x + size, y + size);
        this.minimap.lineTo(x - size, y + size);
        this.minimap.closePath();
        this.minimap.fill();
    }

    public destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        try {
            // Just clear and hide graphics without destroying
            if (this.minimap) {
                this.minimap.clear();
                this.minimap.alpha = 0;
            }
            
            if (this.minimapBorder) {
                this.minimapBorder.clear();
                this.minimapBorder.alpha = 0;
            }
        } catch (error) {
            console.warn('Error during minimap cleanup:', error);
        }
    }
}