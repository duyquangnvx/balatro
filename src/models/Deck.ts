import { Scene } from 'phaser';
import { Card } from './Card';
import { Suit, Rank } from './types';
import { DeckStyle } from './DeckStyle';

export class Deck {
    private cards: Card[];
    private scene: Scene;
    private totalCards: number = 52;
    private discardedCards: number = 0;
    private deckText: Phaser.GameObjects.Text;
    private currentStyle: DeckStyle;
    private deckX: number;
    private deckY: number;

    constructor(scene: Scene) {
        this.scene = scene;
        this.cards = [];
        this.discardedCards = 0;
        this.currentStyle = DeckStyle.RED; // Default style
        
        // Set deck position to bottom right
        this.deckX = this.scene.cameras.main.width - 100;
        this.deckY = this.scene.cameras.main.height - 120;
        
        // Create deck count text
        this.deckText = this.scene.add.text(
            this.deckX + 40, 
            this.deckY + 105, // Below the deck
            "0/52", // Initial text before cards are created
            { 
                fontSize: '18px', 
                color: '#ffffff' 
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Then initialize the deck
        this.initializeDeck();
        this.shuffle();
        this.updateDeckCount(); // Update text after deck is initialized
    }

    private initializeDeck(): void {
        // Clear existing cards
        this.cards = [];
        
        // Create all 52 cards
        Object.values(Suit).forEach((suit, suitIndex) => {
            Object.values(Rank).forEach((rank, rankIndex) => {
                // Calculate card index
                const cardIndex = suitIndex * Object.values(Rank).length + rankIndex;
                
                // Create card at deck position
                const card = new Card(
                    this.scene,
                    this.deckX,  // Deck position X
                    this.deckY,  // Deck position Y
                    suit,
                    rank,
                    this.currentStyle
                );
                
                this.scene.add.existing(card); // Add to scene immediately
                card.setDepth(cardIndex); // Set depth based on card index for stacking
                this.cards.push(card);
            });
        });
        
        // Apply 3D effect to top 10 cards after shuffling
        this.applyDeck3DEffect();
    }

    private shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        // Re-apply 3D effect after shuffling
        this.applyDeck3DEffect();
    }
    
    /**
     * Apply 3D effect to the top 10 cards of the deck
     */
    private applyDeck3DEffect(): void {
        // Only apply effect to the last 10 cards (top of the deck)
        const startIndex = Math.max(0, this.cards.length - 15);
        
        for (let i = startIndex; i < this.cards.length; i++) {
            // Calculate how far this card is from the bottom of the visible stack (0-9)
            const stackPosition = i - startIndex;
            
            // Calculate offset based on position in the stack
            // Higher cards (higher stackPosition) get more offset
            const offsetX = stackPosition * 0.5; // 0 to 4.5 pixels right
            const offsetY = -stackPosition * 0.5; // 0 to -4.5 pixels up
            
            // Calculate rotation based on position in the stack
            // Higher cards get more rotation
            const rotation = stackPosition * 0.2 * (Math.PI / 180); // 0 to 1.8 degrees
            
            // Apply position and rotation
            this.cards[i].setPosition(this.deckX + offsetX, this.deckY + offsetY);
            this.cards[i].setRotation(rotation);
            
            // Ensure proper depth
            this.cards[i].setDepth(i);
        }
    }

    public drawCard(): Card | undefined {
        if (this.cards.length === 0) {
            console.log("Deck is empty!");
            return undefined;
        }
        
        const card = this.cards.pop();
        if (card) {
            // Reset rotation when drawing
            card.setRotation(0);
            
            // Set a higher depth for drawn cards
            card.setDepth(10);
            this.discardedCards++; // Increment discarded count when card is drawn
        }
        
        // Re-apply 3D effect to the remaining cards
        this.applyDeck3DEffect();
        
        this.updateDeckCount();
        return card;
    }

    public drawCards(count: number): Card[] {
        const drawnCards: Card[] = [];
        for (let i = 0; i < count && this.cards.length > 0; i++) {
            const card = this.drawCard();
            if (card) {
                drawnCards.push(card);
            }
        }
        return drawnCards;
    }

    public returnCard(card: Card): void {
        // Flip card face down
        card.flip(false);
        
        // Reset rotation and position
        card.setRotation(0);
        card.setPosition(this.deckX, this.deckY);
        
        // Add card back to deck
        this.cards.push(card);
        
        // Re-apply 3D effect to update the deck appearance
        this.applyDeck3DEffect();
        
        this.updateDeckCount();
    }

    private getDeckCountText(): string {
        return `${this.cards.length}/${this.totalCards - this.discardedCards}`;
    }

    private updateDeckCount(): void {
        this.deckText.setText(this.getDeckCountText());
    }

    /**
     * Get the current deck style
     */
    public getDeckStyle(): DeckStyle {
        return this.currentStyle;
    }

    /**
     * Set the current deck style
     * @param style The new deck style
     */
    public setDeckStyle(style: DeckStyle): void {
        this.currentStyle = style;
        this.refreshCardBacks();
    }

    /**
     * Refresh all face-down cards to show the current card back style
     */
    public refreshCardBacks(): void {
        this.cards.forEach(card => {
            if (!card.isVisible) {
                card.setDeckStyle(this.currentStyle);
                // Re-flip the card to update its back texture
                card.flip(false);
            }
        });
    }

    public destroy(): void {
        this.cards.forEach(card => card.destroy());
        this.deckText.destroy();
    }

    /**
     * Get the number of cards that have been discarded (destroyed)
     */
    public getDiscardedCount(): number {
        return this.discardedCards;
    }

    /**
     * Get the number of cards remaining in the deck
     */
    public getRemainingCards(): number {
        return this.cards.length;
    }

    /**
     * Get the total number of cards still in play (not discarded)
     */
    public getTotalCardsInPlay(): number {
        return this.totalCards - this.discardedCards;
    }
} 