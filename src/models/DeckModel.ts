import { CardModel } from './CardModel';
import { Suit, Rank } from './types';
import { DeckStyle } from './DeckStyle';
import EventBus from '../base/EventBus';
import { GameEvents } from '../data/GameEvents';

export class DeckModel {
    private cards: CardModel[] = [];
    private totalCards: number = 52;
    private discardedCards: number = 0;
    private currentStyle: DeckStyle;
    private eventBus: EventBus;

    constructor() {
        this.eventBus = EventBus.getInstance();
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
        Object.values(Suit).forEach(suit => {
            Object.values(Rank).forEach(rank => {
                // Create card model
                const card = new CardModel(suit, rank, this.currentStyle);
                this.cards.push(card);
            });
        });
        
        // Notify that deck was initialized
        this.eventBus.emit(GameEvents.DECK_SHUFFLED, this);
    }

    public shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        // Notify that deck was shuffled
        this.eventBus.emit(GameEvents.DECK_SHUFFLED, this);
    }

    public drawCard(): CardModel | undefined {
        if (this.cards.length === 0) {
            this.eventBus.emit(GameEvents.DECK_EMPTY, this);
            return undefined;
        }
        
        const card = this.cards.pop();
        if (card) {
            this.discardedCards++; // Increment discarded count when card is drawn
            this.eventBus.emit(GameEvents.CARDS_DRAWN, [card]);
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
        card.flip(false);
        
        // Add card back to deck
        this.cards.push(card);
        
        // Notify that a card was returned
        this.eventBus.emit(GameEvents.CARD_RETURNED, card);
    }

    public getDeckCountText(): string {
        return `${this.cards.length}/${this.totalCards}`;
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
     * Get all cards in the deck
     */
    public getCards(): CardModel[] {
        return [...this.cards];
    }
} 