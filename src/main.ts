import 'phaser';
import { BootScene } from './scenes/boot-scene';
import { PreloadScene } from './scenes/preload-scene';
import { GameScene } from './scenes/game-scene';
import { LoadingScene } from './scenes/loading-scene';
import { TransitionFade } from './scenes/transitions/transition-scene';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    scene: [BootScene, TransitionFade, PreloadScene, LoadingScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    loader: {
        baseURL: '',
        path: 'assets/',
    }
};

new Phaser.Game(config);