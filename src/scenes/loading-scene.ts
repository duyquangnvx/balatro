import { Scene } from "phaser";
import { Logger } from "../core/logger";

export class LoadingScene extends Phaser.Scene {
    private progressBar: Phaser.GameObjects.Rectangle;
    private progressBox: Phaser.GameObjects.Rectangle;
    private loadingText: Phaser.GameObjects.Text;
    private textPercent: Phaser.GameObjects.Text;

    private currentTargetScene: Scene;

    private static readonly PROGRESS_BAR_WIDTH = 300;

    constructor() {
        super({ key: 'LoadingScene' });
    }

    create(): void {
        Logger.info('LoadingScene: create() called');

        this.initDisplay();

        // Hide the scene initially
        this.scene.setVisible(false);
    }

    private initDisplay(): void {
        Logger.info('LoadingScene: initializing display');

        // Get the width and height of the main camera
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a background rectangle
        this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);

        // Create a progress box
        this.progressBox = this.add.rectangle(width/2, height/2, LoadingScene.PROGRESS_BAR_WIDTH, 50, 0x666666);

        // Create a progress bar
        this.progressBar = this.add.rectangle(width/2, height/2, LoadingScene.PROGRESS_BAR_WIDTH, 30, 0xffffff);
        this.progressBar.setOrigin(0, 0.5);
   
        // Create a loading text
        this.loadingText = this.make.text({
            x: width/2,
            y: height/2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        this.loadingText.setOrigin(0.5, 0.5);

        // Create a percentage text
        this.textPercent = this.make.text({
            x: width/2,
            y: height/2 - 20,
            text: '0%',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        this.textPercent.setOrigin(0.5, 0.5);
    }

    show(): void {
        this.scene.setVisible(true);
        this.scene.bringToTop();
    }

    hide(): void {
        this.scene.setVisible(false);
    }

    shutdown(): void {
        Logger.info('LoadingScene: shutdown called');

        this.offEventListeners(this.currentTargetScene);
    }

    monitorLoading(targetScene: Scene): void {
        // Remove event listeners for the previous target scene
        this.offEventListeners(this.currentTargetScene);

        // Set the current target scene
        this.currentTargetScene = targetScene;

        Logger.info(`LoadingScene: monitoring loading for ${targetScene.scene.key}`);

        // Add event listeners for the new target scene
        targetScene.load.on('progress', this.onProgress.bind(this));
        targetScene.load.on('complete', this.onComplete.bind(this));
        targetScene.load.on('error', this.onError.bind(this));

        this.show();
        this.updateLoadingBar(0);
    }


    private onProgress(progress: number): void {
        Logger.info('LoadingScene: updating progress bar:', progress);
        this.updateLoadingBar(progress);
    }

    private onComplete(): void {
        Logger.info('LoadingScene: loading complete, starting GameScene');
        this.hide();
        this.offEventListeners(this.currentTargetScene);
    }

    private onError(error: Error): void {
        Logger.error('LoadingScene: error loading assets:', error);
        this.loadingText.setText('Error loading assets. Please refresh the page.');
    }

    private updateLoadingBar(progress: number): void {
        this.progressBar.width = LoadingScene.PROGRESS_BAR_WIDTH * progress;
        this.textPercent.setText(`${Math.round(progress * 100)}%`);
        this.loadingText.setText('Loading...');
    }

    private offEventListeners(targetScene: Scene): void {
        if (targetScene) {
            targetScene.load.off('progress', this.onProgress.bind(this));
            targetScene.load.off('complete', this.onComplete.bind(this));
            targetScene.load.off('error', this.onError.bind(this));
        }
    }
}   
