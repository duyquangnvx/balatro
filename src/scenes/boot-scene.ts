import { Logger } from '../utils/logger';
import { BaseScene } from './base-scene';
import { TransitionFade } from './transitions/transition-scene';
import { GameManager } from '../managers/game-manger';
import { ScoreManager } from '../managers/score-manager';
import { RunManager } from '../managers/run-manager';

// BootScene - Manages the boot process
export class BootScene extends BaseScene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload(): void {
        Logger.enableDebug();
        Logger.info('BootScene: preload() called');

        GameManager.getInstance().init();
        RunManager.getInstance().init();
        ScoreManager.getInstance().init();

        // Start PreloadScene after a short delay to ensure initialization is complete
        this.time.delayedCall(100, () => {
            TransitionFade.start({
                fromScene: this,
                toScene: 'PreloadScene',
                data: {}
            });
        });
    }
}
