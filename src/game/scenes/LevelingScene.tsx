import { Scene } from 'phaser';
import { socket } from '../../services/socket';
import { createRoot } from 'react-dom/client';
import { LevelUpUI } from '../../components/LevelUpUI';

export class LevelingScene extends Scene {
    private levelUpContainer: HTMLDivElement | null = null;
    private isLevelUpVisible: boolean = false;
    private root: any = null;

    constructor() {
        super({ key: 'LevelingScene' });
        console.log('[LevelingScene] Constructor called');
    }

    init() {
        console.log('[LevelingScene] Init called');
        this.isLevelUpVisible = true; // Show UI immediately when scene starts
    }

    create() {
        console.log('[LevelingScene] Scene created');
        
        // Create the container for React
        this.levelUpContainer = document.createElement('div');
        this.levelUpContainer.style.position = 'fixed';
        this.levelUpContainer.style.top = '0';
        this.levelUpContainer.style.left = '0';
        this.levelUpContainer.style.width = '100%';
        this.levelUpContainer.style.height = '100%';
        this.levelUpContainer.style.pointerEvents = 'none';
        this.levelUpContainer.style.zIndex = '1000';
        document.body.appendChild(this.levelUpContainer);

        // Create React root
        this.root = createRoot(this.levelUpContainer);
        console.log('[LevelingScene] React root created');

        // Initial render with UI visible
        this.renderUI();

        // Listen for attribute upgrade events
        socket.on('player:attributeUpgraded', (data: { attribute: string, newValue: number, remainingPoints: number }) => {
            console.log('[LevelingScene] Attribute upgraded:', data);
            this.hideAndStop();
        });

        // Listen for upgrade errors
        socket.on('player:upgradeError', (data: { message: string }) => {
            console.error('[LevelingScene] Upgrade error:', data.message);
        });
    }

    private hideAndStop() {
        console.log('[LevelingScene] Hiding UI and stopping scene');
        this.isLevelUpVisible = false;
        this.renderUI();
        
        // Give a small delay to allow the UI to hide before stopping the scene
        this.time.delayedCall(100, () => {
            this.scene.stop();
        });
    }

    private renderUI() {
        console.log('[LevelingScene] Rendering UI, isVisible:', this.isLevelUpVisible);
        if (this.root) {
            this.root.render(
                <LevelUpUI 
                    isVisible={this.isLevelUpVisible}
                    onAttributeSelected={() => {
                        console.log('[LevelingScene] Attribute selected');
                        this.hideAndStop();
                    }}
                />
            );
        }
    }

    destroy() {
        console.log('[LevelingScene] Destroying scene');
        // Clean up socket listeners
        socket.off('player:attributeUpgraded');
        socket.off('player:upgradeError');

        // Clean up React
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }

        // Remove container
        if (this.levelUpContainer) {
            this.levelUpContainer.remove();
            this.levelUpContainer = null;
        }
    }
} 