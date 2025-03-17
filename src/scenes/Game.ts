import { Scene } from 'phaser';
import { SceneKeys } from './SceneKeys';

export class Game extends Scene
{
    constructor ()
    {
        super({ key: SceneKeys.GAME });
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
    }

    create ()
    {
        
    }


    destroy(): void {
        
    }
}
