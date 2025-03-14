import { Scene } from 'phaser';
import { SceneKeys } from './SceneKeys';
import { AssetManager } from '../managers/AssetManager';

export class PreloadScene extends Scene {
    private progressBar!: Phaser.GameObjects.Graphics;
    private progressBox!: Phaser.GameObjects.Graphics;
    private loadingText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: SceneKeys.PRELOAD });
    }

    preload(): void {
        this.createLoadingUI();
        this.setupProgressListeners();
        
        // Let AssetManager handle all asset preloading
        AssetManager.preloadAll(this.load);
    }

    private createLoadingUI(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create progress box and bar
        this.progressBar = this.add.graphics();
        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0x222222, 0.8);
        this.progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        // Create loading text
        this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px monospace',
            color: '#ffffff'
        });
        this.loadingText.setOrigin(0.5, 0.5);
    }

    private setupProgressListeners(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Update progress bar as assets load
        this.load.on('progress', (value: number) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0xffffff, 1);
            this.progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        // Clean up and transition when loading completes
        this.load.on('complete', () => {
            this.cleanupLoadingUI();
            this.scene.start(SceneKeys.GAMEPLAY);
        });
    }

    private cleanupLoadingUI(): void {
        this.progressBar.destroy();
        this.progressBox.destroy();
        this.loadingText.destroy();
    }

    create(): void {
        // This scene will automatically transition to GameScene when loading is complete
    }
} 