import { Scene } from 'phaser';
import { Hand } from '../models/Hand';
import { CardObject } from './CardObject';
import { DeckObject } from './DeckObject';
import { GameplayService } from '../GameplayService';

/**
 * HandObject - UI representation of a Hand model
 */
export class HandObject {
    private scene: Scene;
    private hand: Hand;
    private cardObjects: Map<string, CardObject> = new Map();
    private readonly CARD_SPACING = 80;
    private readonly BOTTOM_MARGIN = 200;
    private readonly SELECTED_OFFSET = 20;
    private gameplayService: GameplayService;
    
    // UI elements
    private playHandButton: Phaser.GameObjects.Text;
    private discardButton: Phaser.GameObjects.Text;
    private sortContainer: Phaser.GameObjects.Container;
    private sortByRankButton: Phaser.GameObjects.Text;
    private sortBySuitButton: Phaser.GameObjects.Text;
    private handCountText: Phaser.GameObjects.Text;
    private deckObject: DeckObject;

    constructor(scene: Scene, hand: Hand, deckObject: DeckObject) {
        this.scene = scene;
        this.hand = hand;
        this.deckObject = deckObject;
        this.gameplayService = GameplayService.getInstance();
        
        // Create UI elements
        this.createButtons();
        
        // Create initial card objects
        this.createCardObjects();
        
        // Arrange cards
        this.arrangeCards();
    }

    private createCardObjects(): void {
        // Clear existing card objects
        this.cardObjects.clear();
        
        // Create card objects for all cards in hand
        const cards = this.hand.getAllCards();
        cards.forEach(card => {
            // Create a unique key for the card
            const cardKey = `${card.suit}_${card.rank}`;
            
            // Create a card object
            const cardObject = new CardObject(
                this.scene,
                0, // Will be positioned by arrangeCards
                0,
                card
            );
            
            // Store the card object
            this.cardObjects.set(cardKey, cardObject);
        });
    }

    private createButtons(): void {
        const centerX = this.scene.cameras.main.width / 2;
        const buttonY = this.scene.cameras.main.height - 50;
        
        // Create Play Hand button
        this.playHandButton = this.scene.add.text(
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
        
        // Create container for Sort Hand and child buttons
        this.sortContainer = this.scene.add.container(centerX, buttonY);
        
        // Background for sort container
        const sortBackground = this.scene.add.graphics();
        sortBackground.fillStyle(0x006600, 1);
        sortBackground.fillRoundedRect(-80, -30, 160, 60, 10);
        sortBackground.lineStyle(2, 0xFFFFFF, 1);
        sortBackground.strokeRoundedRect(-80, -30, 160, 60, 10);
        this.sortContainer.add(sortBackground);
        
        // Sort Hand title
        const sortTitle = this.scene.add.text(
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
        this.sortByRankButton = this.scene.add.text(
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
        this.sortBySuitButton = this.scene.add.text(
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
        this.discardButton = this.scene.add.text(
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
        
        // Hand count text
        const baseY = this.scene.cameras.main.height - this.BOTTOM_MARGIN;
        this.handCountText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            baseY + 50,
            this.getHandCountText(),
            {
                fontSize: '18px',
                color: '#ffffff'
            }
        ).setOrigin(0.5).setName('handCountText');
        
        // Add event listeners
        this.playHandButton.on('pointerdown', () => {
            console.log('Play Hand clicked - to be implemented');
        });
        
        this.sortByRankButton.on('pointerdown', () => {
            this.hand.sortByRank();
            this.arrangeCards();
        });
        
        this.sortBySuitButton.on('pointerdown', () => {
            this.hand.sortBySuit();
            this.arrangeCards();
        });
        
        this.discardButton.on('pointerdown', () => {
            this.discardSelectedCards();
        });
    }

    private arrangeCards(): void {
        const cards = this.hand.getAllCards();
        const totalWidth = (cards.length - 1) * this.CARD_SPACING;
        const startX = (this.scene.cameras.main.width - totalWidth) / 2;
        const baseY = this.scene.cameras.main.height - this.BOTTOM_MARGIN;

        cards.forEach((card, index) => {
            // Find the card object for this card
            const cardKey = `${card.suit}_${card.rank}`;
            const cardObject = this.cardObjects.get(cardKey);
            
            if (cardObject) {
                const x = startX + (index * this.CARD_SPACING);
                const y = baseY - (this.hand.isCardSelected(card) ? this.SELECTED_OFFSET : 0);
                
                cardObject.setPosition(x, y);
                cardObject.setDepth(index); // Ensure proper layering
            }
        });
        
        // Update hand count text
        this.handCountText.setText(this.getHandCountText());
    }

    private getHandCountText(): string {
        return `${this.hand.getAllCards().length}/8`;
    }

    private discardSelectedCards(): void {
        // Get selected cards before they're discarded
        const selectedCards = this.hand.getSelectedCards();
        if (selectedCards.length === 0) return;
        
        // Remove card objects for selected cards
        selectedCards.forEach(card => {
            const cardKey = `${card.suit}_${card.rank}`;
            const cardObject = this.cardObjects.get(cardKey);
            
            if (cardObject) {
                cardObject.destroy();
                this.cardObjects.delete(cardKey);
            }
        });
        
        // Discard selected cards in the model
        this.hand.discardSelectedCards();
        
        // Create new card objects for newly drawn cards
        this.createCardObjects();
        
        // Rearrange cards
        this.arrangeCards();
    }

    /**
     * Update the hand object based on model changes
     */
    public update(): void {
        // Update all card objects
        this.cardObjects.forEach(cardObject => {
            cardObject.update();
        });
        
        // Rearrange cards
        this.arrangeCards();
    }

    /**
     * Clean up resources
     */
    public destroy(): void {
        this.playHandButton.destroy();
        this.discardButton.destroy();
        this.sortContainer.destroy();
        this.handCountText.destroy();
        
        this.cardObjects.forEach(cardObject => cardObject.destroy());
        this.cardObjects.clear();
    }
} 