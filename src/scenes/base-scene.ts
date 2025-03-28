import { Scene } from "phaser";
import { Logger } from "../core/logger";
import { LoadingScene } from "./loading-scene";

export class BaseScene extends Phaser.Scene {
    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }
    
    preload(): void {
        Logger.info(`${this.scene.key}: preload() called`);
    }

    create(): void {
        Logger.info(`${this.scene.key}: create() called`);
        this.cameras.main.fadeIn(500);
    }

    shutdown(): void {
        Logger.info(`${this.scene.key}: shutdown() called`);
        this.cameras.main.fadeOut(500);
    }
}