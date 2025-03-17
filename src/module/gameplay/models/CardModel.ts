import { ICard, Suit, Rank, Enhancement, DeckStyle } from './types';

/**
 * Card model class - Contains card data and business logic
 */
export class CardModel implements ICard {
    public suit: Suit;
    public rank: Rank;
    public value: number;
    public faceUp: boolean;
    private enhancement: Enhancement = Enhancement.NORMAL;
    
    // Reference to the deck this card belongs to (can be null if not in a deck)
    private deckReference: any = null;

    constructor(suit: Suit, rank: Rank) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = false;
        this.value = this.calculateValue();
    }

    private calculateValue(): number {
        switch (this.rank) {
            case Rank.ACE:
                return 11; // Ace is worth 11 points
            case Rank.JACK:
            case Rank.QUEEN:
            case Rank.KING:
                return 10; // Face cards are worth 10 points
            default:
                return parseInt(this.rank) || 0; // Number cards worth their face value
        }
    }

    public getSuit(): Suit {
        return this.suit;
    }

    public getRank(): Rank {
        return this.rank;
    }

    public getValue(): number {
        return this.value;
    }

    public isFaceUp(): boolean {
        return this.faceUp;
    }

    /**
     * Set the reference to the deck this card belongs to
     * @param deck The deck this card belongs to
     */
    public setDeckReference(deck: any): void {
        this.deckReference = deck;
    }

    /**
     * Get the deck style from the deck this card belongs to
     * If no deck is referenced, returns undefined
     */
    public getDeckStyle(): any {
        if (this.deckReference && typeof this.deckReference.getDeckStyle === 'function') {
            return this.deckReference.getDeckStyle();
        }
        return DeckStyle.RED;
    }

    /**
     * Set the enhancement type for this card
     * @param enhancement The new enhancement type
     */
    public setEnhancement(enhancement: Enhancement): void {
        this.enhancement = enhancement;
    }

    /**
     * Get the current enhancement type
     */
    public getEnhancement(): Enhancement {
        return this.enhancement;
    }

    /**
     * Flip the card face up or face down
     * @param faceUp Whether the card should be face up
     */
    public setFaceUp(faceUp: boolean = true): void {
        this.faceUp = faceUp;
    }
} 