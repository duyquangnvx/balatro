import { CardModel } from './CardModel';
import { DeckStyle, Rank, Suit } from './types';

/**
 * Deck model class - Contains deck data and business logic
 */
export class DeckModel {
    private cards: CardModel[];
    private totalCards: number = 52;
    private discardedCards: number = 0;
    private currentStyle: DeckStyle;

    constructor() {
        this.cards = [];
        this.discardedCards = 0;
        this.currentStyle = DeckStyle.RED; // Default style
        
        // Initialize the deck
        this.initializeDeck();
    }

    private initializeDeck(): void {
         // Clear existing cards
         this.cards = [];
        
         // Create all 52 cards
         Object.values(Suit).forEach(suit => {
             Object.values(Rank).forEach(rank => {
                 const card = new CardModel(suit, rank);
                 card.setDeckReference(this);
                 this.cards.push(card);
             });
         });
    }

    public shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public drawCard(): CardModel | undefined {
        if (this.cards.length === 0) {
            console.log("Deck is empty!");
            return undefined;
        }
        
        const card = this.cards.pop();
        if (card) {
            this.discardedCards++; // Increment discarded count when card is drawn
        }
        
        return card;
    }

    public drawCards(count: number): CardModel[] {
        const drawnCards: CardModel[] = [];
        for (let i = 0; i < count && this.cards.length > 0; i++) {
            const card = this.drawCard();
            if (card) {
                drawnCards.push(card);
            }
        }
        return drawnCards;
    }

    public returnCard(card: CardModel): void {
        // Flip card face down
        card.setFaceUp(false);
        
        // Ensure card references this deck
        card.setDeckReference(this);
        
        // Add card back to deck
        this.cards.push(card);
    }

    public getDeckStyle(): DeckStyle {
        return this.currentStyle;
    }

    public setDeckStyle(style: DeckStyle): void {
        this.currentStyle = style;
    }

    public getDiscardedCount(): number {
        return this.discardedCards;
    }

    public getRemainingCards(): number {
        return this.cards.length;
    }

    public getTotalCardsInPlay(): number {
        return this.totalCards - this.discardedCards;
    }
    
    public destroy(): void {
        // No resources to clean up in the model
        this.cards = [];
    }

    public getCards(): CardModel[] {
        return [...this.cards];
    }
} 