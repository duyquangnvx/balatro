import { BaseScene } from "./base-scene";
import { Logger } from "../core/logger";
import { TransitionFade } from "./transitions/transition-scene";

export class PreloadScene extends BaseScene {
    private progressBar: Phaser.GameObjects.Rectangle;
    private progressBox: Phaser.GameObjects.Rectangle;
    private loadingText: Phaser.GameObjects.Text;
    private textPercent: Phaser.GameObjects.Text;

    private static readonly ATLAS_PATH = 'atlases/';
    private static readonly IMAGE_PATH = 'images/';
    private static readonly SOUND_PATH = 'sounds/';

    private static readonly ATLASES = [
        'card-fronts',
        'card-backs',
        'card-enhancements',
    ];
    
    private static readonly IMAGES = [
        'bg',
        'logo',
    ];

    private static readonly SOUNDS = [
        // 'click',
    ];

    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload(): void {
        super.preload();

        this.initDisplay();
        
        this.textures.createCanvas('blank', 1, 1); // 1x1 transparent texture

        this.load.on('progress', this.onProgress, this);
        this.load.on('complete', this.onComplete, this);
        this.load.on('error', this.onError, this);

        // Preload atlases
        PreloadScene.ATLASES.forEach(atlas => {
        this.load.atlas(atlas, PreloadScene.ATLAS_PATH + atlas + '.png', PreloadScene.ATLAS_PATH + atlas + '.json');
        });

        // Preload images   
        PreloadScene.IMAGES.forEach(image => {
            this.load.image(image, PreloadScene.IMAGE_PATH + image + '.png');
        });

        // Preload sounds
        PreloadScene.SOUNDS.forEach(sound => {
            this.load.audio(sound, PreloadScene.SOUND_PATH + sound + '.wav');
        });
    }

    private initDisplay(): void {
        Logger.info('PreloadScene: initializing display');

        // Get the width and height of the main camera
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progressBarWidth = 300;

        // Create a background rectangle
        this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);

        // Create a progress box
        this.progressBox = this.add.rectangle(width/2, height/2, progressBarWidth, 50, 0x666666);

        // Create a progress bar
        this.progressBar = this.add.rectangle(width/2, height/2, progressBarWidth, 30, 0xffffff);
   
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

    private onProgress(progress: number): void {
        Logger.info('PreloadScene: updating progress bar:', progress);
        this.updateLoadingBar(progress);
    }

    private onComplete(): void {
        Logger.info('PreloadScene: loading complete, starting GameScene');

        TransitionFade.start({
            fromScene: this,
            toScene: 'GameScene',
            data: {}
        });
    }

    private onError(error: Error): void {
        Logger.error('PreloadScene: error loading assets:', error);
        this.loadingText.setText('Error loading assets. Please refresh the page.');
    }

    private updateLoadingBar(progress: number): void {
        this.progressBar.width = this.progressBox.width * progress;
        this.textPercent.setText(`${Math.round(progress * 100)}%`);
        this.loadingText.setText('Loading...');
    }

    shutdown(): void {
        Logger.info('PreloadScene: shutdown called');

        this.load.off('progress', this.onProgress, this);
        this.load.off('complete', this.onComplete, this);
        this.load.off('error', this.onError, this);
    }
}   