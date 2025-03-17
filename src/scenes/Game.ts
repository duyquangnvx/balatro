import { Scene } from 'phaser';
import { SceneKeys } from './SceneKeys';
import { DeckStyle } from '../module/gameplay/models/types';
import { Enhancement } from '../module/gameplay/models/types';
import { GameplayService } from '../module/gameplay/GameplayService';
import { DeckObject } from '../module/gameplay/objects/DeckObject';
import { HandObject } from '../module/gameplay/objects/HandObject';

export class Game extends Scene
{
    private gameplayService!: GameplayService;
    private deckObject!: DeckObject;
    private handObject!: HandObject;

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
        // Add background centered in the screen
        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        bg.setOrigin(0.5, 0.5); // Center the image

        // Initialize gameplay service
        this.gameplayService = GameplayService.getInstance();
        this.gameplayService.initialize(this);
        
        // Create UI objects
        const deck = this.gameplayService.getDeck();
        const hand = this.gameplayService.getPlayerHand();
        
        if (deck && hand) {
            this.deckObject = new DeckObject(this, deck);
            this.handObject = new HandObject(this, hand, this.deckObject);
        }
        
        // Add deck style button
        const styleButton = this.add.text(
            20, 
            20, 
            'Change Card Back', 
            { 
                fontSize: '18px', 
                color: '#ffffff',
                backgroundColor: '#0066cc',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();
        
        // Simple cycling through styles on click
        styleButton.on('pointerdown', () => {
            this.cycleDeckStyle();
        });

        // Add enhancement button
        const enhancementButton = this.add.text(
            20, 
            60, 
            'Change Enhancement', 
            { 
                fontSize: '18px', 
                color: '#ffffff',
                backgroundColor: '#cc6600',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();
        
        // Cycle through enhancements on click
        enhancementButton.on('pointerdown', () => {
            this.cycleEnhancement();
        });
    }

    /**
     * Cycle through available deck styles
     */
    private cycleDeckStyle(): void {
        const styles = Object.values(DeckStyle);
        const currentStyle = this.gameplayService.getDeckStyle();
        if (currentStyle) {
            const currentIndex = styles.indexOf(currentStyle);
            const nextIndex = (currentIndex + 1) % styles.length;
            
            this.gameplayService.setDeckStyle(styles[nextIndex]);
            
            // Update UI objects
            if (this.deckObject) {
                this.deckObject.update();
            }
        }
    }

    /**
     * Cycle through available enhancements for selected cards
     */
    private cycleEnhancement(): void {
        const enhancements = Object.values(Enhancement);
        const selectedCards = this.gameplayService.getSelectedCards();
        
        if (selectedCards.length === 0) {
            console.log('No cards selected. Please select a card first.');
            return;
        }
        
        // Get the enhancement of the first selected card
        const currentEnhancement = selectedCards[0].getEnhancement();
        const currentIndex = enhancements.indexOf(currentEnhancement);
        const nextIndex = (currentIndex + 1) % enhancements.length;
        const nextEnhancement = enhancements[nextIndex];
        
        // Apply the new enhancement to all selected cards
        this.gameplayService.enhanceSelectedCards(nextEnhancement);
        
        // Update UI objects
        if (this.handObject) {
            this.handObject.update();
        }
    }

    destroy(): void {
        if (this.deckObject) {
            this.deckObject.destroy();
        }
        
        if (this.handObject) {
            this.handObject.destroy();
        }
        
        this.gameplayService.destroy();
    }
}
