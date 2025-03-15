import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';
import { BaseUnit } from './units/BaseUnit';

export class Dogtag extends Phaser.Physics.Arcade.Sprite {
    public scene: MainScene;
    private fallenUnit: BaseUnit;
    private respawnTimer: number = 10000; // 10 seconds
    private isCollected: boolean = false;
    private respawnTimerEvent?: Phaser.Time.TimerEvent;

    constructor(scene: MainScene, x: number, y: number, fallenUnit: BaseUnit) {
        super(scene, x, y, 'dogtag');
        this.scene = scene;
        this.fallenUnit = fallenUnit;

        // Create the dogtag texture if it doesn't exist
        if (!scene.textures.exists('dogtag')) {
            this.createDogtagTexture();
        }

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Add a pulsing effect
        scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    private createDogtagTexture(): void {
        const graphics = this.scene.add.graphics();
        
        // Draw dogtag shape
        graphics.lineStyle(2, 0xcccccc);
        graphics.fillStyle(0x999999);
        
        // Main tag shape
        graphics.beginPath();
        graphics.moveTo(0, -8);
        graphics.lineTo(6, -4);
        graphics.lineTo(6, 4);
        graphics.lineTo(0, 8);
        graphics.lineTo(-6, 4);
        graphics.lineTo(-6, -4);
        graphics.closePath();
        graphics.fill();
        graphics.stroke();
        
        // Chain hole
        graphics.lineStyle(1, 0x666666);
        graphics.strokeCircle(0, -6, 2);
        
        // Generate texture
        graphics.generateTexture('dogtag', 16, 16);
        graphics.destroy();
    }

    public collect(): void {
        if (this.isCollected) return;
        
        this.isCollected = true;
        console.log('Dogtag collected, starting respawn timer...');
        
        // Store references before destroying
        const sceneRef = this.scene;
        const unitRef = this.fallenUnit;
        
        // Visual feedback
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 20,
            duration: 500,
            onComplete: () => {
                console.log('Starting respawn timer for', this.respawnTimer, 'ms');
                // Start respawn timer
                this.respawnTimerEvent = sceneRef.time.delayedCall(this.respawnTimer, () => {
                    // Check if scene is still active before respawning
                    if (sceneRef && sceneRef.scene.isActive()) {
                        console.log('Respawn timer completed, attempting to respawn unit');
                        this.respawnUnitWithRefs(sceneRef, unitRef);
                    } else {
                        console.log('Scene is no longer active, canceling respawn');
                    }
                    // Only destroy the dogtag after respawn attempt
                    this.destroy();
                });
                // Don't destroy the dogtag here anymore
                this.setVisible(false); // Just hide it instead
            }
        });
    }

    private respawnUnitWithRefs(scene: MainScene, unit: BaseUnit): void {
        // Check if scene is still active
        if (!scene || !scene.scene.isActive()) {
            console.log('Cannot respawn unit: Scene is not active');
            return;
        }

        // Get a safe spawn position near the player
        const player = scene.getPlayer();
        if (!player) {
            console.error('Cannot respawn unit: Player not found');
            return;
        }

        // Convert angle to radians for Math.cos/sin
        const angleInRadians = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
        const distance = 100;
        const x = player.x + distance * Math.cos(angleInRadians);
        const y = player.y + distance * Math.sin(angleInRadians);
        
        console.log('Respawning unit at position:', { x, y });
        
        // Respawn the unit
        scene.respawnUnit(unit, x, y);
    }

    public isRespawnPending(): boolean {
        return this.isCollected && !!this.respawnTimerEvent && !this.respawnTimerEvent.hasDispatched;
    }

    destroy(fromScene?: boolean): void {
        // Clear the respawn timer if it exists
        if (this.respawnTimerEvent) {
            this.respawnTimerEvent.destroy();
            this.respawnTimerEvent = undefined;
        }
        super.destroy(fromScene);
    }
} 