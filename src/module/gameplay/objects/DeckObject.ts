import { Scene } from 'phaser';
import { Deck } from '../models/Deck';
import { CardObject } from './CardObject';
import { Card } from '../models/Card';
import { GameplayService } from '../GameplayService';

/**
 * DeckObject - UI representation of a Deck model
 */
export class DeckObject {
    private scene: Scene;
    private deck: Deck;
    private deckX: number;
    private deckY: number;
    private deckText: Phaser.GameObjects.Text;
    private cardObjects: CardObject[] = [];
    private gameplayService: GameplayService;

    constructor(scene: Scene, deck: Deck) {
        this.scene = scene;
        this.deck = deck;
        this.gameplayService = GameplayService.getInstance();
        
        // Set deck position to bottom right
        this.deckX = this.scene.cameras.main.width - 100;
        this.deckY = this.scene.cameras.main.height - 120;
        
        // Create deck count text
        this.deckText = this.scene.add.text(
            this.deckX + 40, 
            this.deckY + 105, // Below the deck
            this.getDeckCountText(), 
            { 
                fontSize: '18px', 
                color: '#ffffff' 
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Create visual representation of top cards
        this.createVisualDeck();
    }

    private createVisualDeck(): void {
        // Create visual representation of top 10 cards
        for (let i = 0; i < 10; i++) {
            // Create a card object at the deck position
            const card = new Card(
                'hearts' as any, // Dummy suit, not visible
                'A' as any       // Dummy rank, not visible
            );
            
            // Set reference to the deck
            card.setDeckReference(this.deck);
            
            const cardObject = new CardObject(
                this.scene,
                this.deckX,
                this.deckY,
                card
            );
            
            // Apply 3D effect
            const offsetX = i * 0.5; // 0 to 4.5 pixels right
            const offsetY = -i * 0.5; // 0 to -4.5 pixels up
            const rotation = i * 0.2 * (Math.PI / 180); // 0 to 1.8 degrees
            
            cardObject.setPosition(this.deckX + offsetX, this.deckY + offsetY);
            cardObject.setRotation(rotation);
            cardObject.setDepth(i);
            
            this.cardObjects.push(cardObject);
        }
    }

    /**
     * Draw a card from the deck and create a CardObject for it
     */
    public drawCard(): CardObject | undefined {
        const card = this.deck.drawCard();
        if (!card) return undefined;
        
        // Create a card object for the drawn card
        const cardObject = new CardObject(
            this.scene,
            this.deckX,
            this.deckY,
            card
        );
        
        // Reset rotation
        cardObject.setRotation(0);
        
        // Set a higher depth for drawn cards
        cardObject.setDepth(100);
        
        // Update deck count
        this.updateDeckCount();
        
        return cardObject;
    }

    /**
     * Draw multiple cards from the deck
     */
    public drawCards(count: number): CardObject[] {
        const drawnCardObjects: CardObject[] = [];
        for (let i = 0; i < count; i++) {
            const cardObject = this.drawCard();
            if (cardObject) {
                drawnCardObjects.push(cardObject);
            }
        }
        return drawnCardObjects;
    }

    private getDeckCountText(): string {
        return `${this.deck.getRemainingCards()}/${this.deck.getTotalCardsInPlay()}`;
    }

    private updateDeckCount(): void {
        this.deckText.setText(this.getDeckCountText());
    }

    /**
     * Update the deck object based on model changes
     */
    public update(): void {
        // Update deck count
        this.updateDeckCount();
        
        // Update card back style for all visual cards
        this.cardObjects.forEach(cardObject => {
            cardObject.update();
        });
    }

    /**
     * Clean up resources
     */
    public destroy(): void {
        this.deckText.destroy();
        this.cardObjects.forEach(cardObject => cardObject.destroy());
        this.cardObjects = [];
    }
} 