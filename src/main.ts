import 'phaser';
import { BootScene } from './scenes/boot-scene';
import { PreloadScene } from './scenes/preload-scene';
import { GameScene } from './scenes/game-scene';
import { LoadingScene } from './scenes/loading-scene';
import { TestScene } from './scenes/test-scene';
import { TransitionFade } from './scenes/transitions/transition-scene';
import { GAME_CONFIG } from './config/game-config';
import { GameLoop } from './utils/game-loop';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import DropShadowPipelinePlugin from 'phaser3-rex-plugins/plugins/dropshadowpipeline-plugin.js';
import { GameOverScene } from './scenes/game-over-scene';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.SCREEN_WIDTH,
    height: GAME_CONFIG.SCREEN_HEIGHT,
    parent: 'game-container',
    scene: [BootScene, TransitionFade, PreloadScene, LoadingScene, GameScene, TestScene, GameOverScene],
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
    },
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: RexUIPlugin,
            mapping: 'rexUI'
        }],
        global: [{
            key: 'rexDropShadowPipeline',
            plugin: DropShadowPipelinePlugin,
            start: true
        }]
    }
};

// Khởi tạo game và GameLoop
const game = new Phaser.Game(config);
GameLoop.init(game);