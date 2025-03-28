import { Logger } from '../core/logger';
import { BaseScene } from './base-scene';
import { TransitionFade } from './transitions/transition-scene';
// BootScene - Manages the boot process
export class BootScene extends BaseScene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload(): void {
        Logger.enableDebug();
        Logger.info('BootScene: preload() called');

        // Start PreloadScene after a short delay to ensure initialization is complete
        this.time.delayedCall(1000, () => {
            TransitionFade.start({
                fromScene: this,
                toScene: 'PreloadScene',
                data: {}
            });
        });
    }
}
