import { Card } from './Card';
import { DeckStyle } from './types';

/**
 * Deck model class - Contains deck data and business logic
 */
export class Deck {
    private cards: Card[];
    private totalCards: number = 52;
    private discardedCards: number = 0;
    private currentStyle: DeckStyle;

    constructor() {
        this.cards = [];
        this.discardedCards = 0;
        this.currentStyle = DeckStyle.RED; // Default style
        
        // Initialize the deck
        this.initializeDeck();
        this.shuffle();
    }

    private initializeDeck(): void {
        // Clear existing cards
        this.cards = [];
        
        // Create all 52 cards
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        suits.forEach(suit => {
            ranks.forEach(rank => {
                const card = new Card(
                    suit as any,
                    rank as any,
                    this.currentStyle
                );
                
                // Cards in deck should not be selectable
                card.setSelectable(false);
                
                this.cards.push(card);
            });
        });
    }

    private shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public drawCard(): Card | undefined {
        if (this.cards.length === 0) {
            console.log("Deck is empty!");
            return undefined;
        }
        
        const card = this.cards.pop();
        if (card) {
            // Make card selectable when drawn
            card.setSelectable(true);
            this.discardedCards++; // Increment discarded count when card is drawn
        }
        
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
        
        // Cards in deck should not be selectable
        card.setSelectable(false);
        
        // Add card back to deck
        this.cards.push(card);
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
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        // No resources to clean up in the model
        this.cards = [];
    }
} 