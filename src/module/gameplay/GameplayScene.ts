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
    
    // UI elements
    private handControllerContainer!: Phaser.GameObjects.Container;
    private playHandButton!: Phaser.GameObjects.Text;
    private discardButton!: Phaser.GameObjects.Text;
    private sortContainer!: Phaser.GameObjects.Container;
    private sortByRankButton!: Phaser.GameObjects.Text;
    private sortBySuitButton!: Phaser.GameObjects.Text;

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
        this.createHandController();
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
    
    private createHandController(): void {
        const centerX = this.cameras.main.width / 2;
        const buttonY = this.cameras.main.height - 40;
        
        // Create a container for all buttons
        this.handControllerContainer = this.add.container(0, 0);
        
        // Create Play Hand button
        this.playHandButton = this.add.text(
            centerX - 250, 
            buttonY, 
            'Play Hand', 
            { 
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#555555',
                padding: { x: 15, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        this.handControllerContainer.add(this.playHandButton);
        
        // Create container for Sort Hand and child buttons
        this.sortContainer = this.add.container(centerX, buttonY);
        this.handControllerContainer.add(this.sortContainer);
        
        // Background for sort container
        const sortBackground = this.add.graphics();
        sortBackground.fillStyle(0x006600, 1);
        sortBackground.fillRoundedRect(-80, -30, 160, 60, 10);
        sortBackground.lineStyle(2, 0xFFFFFF, 1);
        sortBackground.strokeRoundedRect(-80, -30, 160, 60, 10);
        this.sortContainer.add(sortBackground);
        
        // Sort Hand title
        const sortTitle = this.add.text(
            0, 
            -20, 
            'Sort Hand', 
            { 
                fontSize: '16px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        this.sortContainer.add(sortTitle);
        
        // Sort by Rank button
        this.sortByRankButton = this.add.text(
            -40, 
            5, 
            'Rank', 
            {
                fontSize: '14px',
                color: '#000000',
                backgroundColor: '#FFA500', // Orange
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setInteractive();
        this.sortContainer.add(this.sortByRankButton);
        
        // Sort by Suit button
        this.sortBySuitButton = this.add.text(
            40, 
            5, 
            'Suit', 
            {
                fontSize: '14px',
                color: '#000000',
                backgroundColor: '#FFA500', // Orange
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setInteractive();
        this.sortContainer.add(this.sortBySuitButton);
        
        // Discard button
        this.discardButton = this.add.text(
            centerX + 250, 
            buttonY, 
            'Discard', 
            { 
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#990000',
                padding: { x: 15, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        this.handControllerContainer.add(this.discardButton);
        
        // Add event listeners
        this.playHandButton.on('pointerdown', () => {
            console.log('Play Hand clicked - to be implemented');
        });
        
        this.sortByRankButton.on('pointerdown', () => this.sortByRank());
        this.sortBySuitButton.on('pointerdown', () => this.sortBySuit());
        this.discardButton.on('pointerdown', () => this.discardSelectedCards());
    }
    
    private sortByRank(): void {
        const hand = this.gameplayService.getPlayerHand();
        hand.sortByRank();
        this.handView.arrangeCards(true); // Use animation
    }

    private sortBySuit(): void {
        const hand = this.gameplayService.getPlayerHand();
        hand.sortBySuit();
        this.handView.arrangeCards(true); // Use animation
    }

    private async discardSelectedCards(): Promise<void> {
        const hand = this.gameplayService.getPlayerHand();
        const discardedCards = hand.discardSelectedCards();
        
        const deck = this.gameplayService.getDeck();
        const newCards = deck.drawCards(discardedCards.length);
        hand.addCards(newCards);
        
        if (discardedCards.length > 0) {
            await this.handView.animateDiscardCards(discardedCards);
            await this.handView.animateDrawCards(this.deckView, newCards);
        }
    }

    private startGame(): void {
        this.gameplayService.startGame();

        // Destroy old views if they exist
        if (this.deckView) {
            this.deckView.destroy();
        }
        if (this.handView) {
            this.handView.destroy();
        }
    
        // Recreate views with new models
        const deck = this.gameplayService.getDeck();
        const hand = this.gameplayService.getPlayerHand();
    
        if (deck && hand) {
            this.deckView = new DeckView(this, deck);
            const deckX = this.cameras.main.width - 100;
            const deckY = this.cameras.main.height - 120;
            this.deckView.setPosition(deckX, deckY);
    
            this.handView = new HandView(this, hand);
            const x = this.cameras.main.width / 2;
            const y = this.cameras.main.height - 120;
            this.handView.setPosition(x, y);
        }
    }

    destroy(): void {
        if (this.deckView) {
            this.deckView.destroy();
        }
        
        if (this.handView) {
            this.handView.destroy();
        }
        
        if (this.handControllerContainer) {
            this.handControllerContainer.destroy();
        }
    }
}
