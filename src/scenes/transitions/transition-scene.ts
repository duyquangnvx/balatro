import { Scene } from "phaser";

export type TransitionConfig = {
    fromScene: Scene;
    toScene: string;
    data?: any;
}

abstract class SceneTransition extends Phaser.Scene {
    protected config: TransitionConfig;

    init(config: TransitionConfig): void {
        this.config = config;
    }

    abstract onTransitionEnter(): Promise<void>;
    abstract onTransitionExit(): Promise<void>;

    preload(): void {
        this.initTransition();
        this.runTransition();
    }

    initTransition(): void {}

    async runTransition(): Promise<void> {
        this.scene.bringToTop();
        await this.onTransitionEnter();
        
        this.scene.run(this.config.toScene, this.config.data);

        this.scene.bringToTop();
        await this.onTransitionExit();
    }
}

export class TransitionFade extends SceneTransition {
    private overlay: Phaser.GameObjects.Rectangle;

    constructor() {
        super({ key: 'TransitionFade' });
    }

    initTransition(): void {
        const width = this.cameras.main.width;  
        const height = this.cameras.main.height
        this.overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000);
    }

    async onTransitionEnter(): Promise<void> {
        this.overlay.setAlpha(0);

        return new Promise((resolve) => {
            this.tweens.add({
                targets: this.overlay,
                alpha: 1,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    resolve();
                }
            });
        });
    }       

    async onTransitionExit(): Promise<void> {
        return new Promise((resolve) => {
            this.tweens.add({
                targets: this.overlay,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    shutdown(): void {
        this.overlay.destroy();
    }

    public static start(config: TransitionConfig): void {
        const { fromScene } = config;
        fromScene.scene.run('TransitionFade', config);
    }
}
