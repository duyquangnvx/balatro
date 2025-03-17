import { Scene } from 'phaser';
import { SceneKeys } from '../../scenes/SceneKeys';
import { GameplayService } from './GameplayService';
import { DeckView } from './views/DeckView';
import { HandView } from './views/HandView';

export class GameplayScene extends Scene
{
    private gameplayService!: GameplayService;
    private deckView!: DeckView;
    private handView!: HandView;

    constructor ()
    {
        super({ key: SceneKeys.GAMEPLAY });

        // Initialize gameplay service
        this.gameplayService = GameplayService.getInstance();
        this.gameplayService.initialize();
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
    }

    create ()
    {
        this.createUI();
        this.startGame();
    }

    private createUI(): void {
        // Add background centered in the screen
        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        bg.setOrigin(0.5, 0.5); // Center the image

        // Create UI objects
        const deck = this.gameplayService.getDeck();
        const hand = this.gameplayService.getPlayerHand();

        if (deck && hand) {
            this.deckView = new DeckView(this, deck);
            // Set deck position to bottom right
            const deckX = this.cameras.main.width - 100;
            const deckY = this.cameras.main.height - 120;
            this.deckView.setPosition(deckX, deckY);

            this.handView = new HandView(this, hand);
            // Set hand position to center bottom
            const x = this.cameras.main.width / 2;
            const y = this.cameras.main.height - 120;
            this.handView.setPosition(x, y);
        }
    }

    private startGame(): void {
        this.gameplayService.startGame();
        this.handView.updateView();
        this.deckView.updateView();
    }

    destroy(): void {
        if (this.deckView) {
            this.deckView.destroy();
        }
        
        if (this.handView) {
            this.handView.destroy();
        }
    }
}
