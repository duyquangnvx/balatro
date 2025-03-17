import { ICard, Suit, Rank, Enhancement } from './types';

/**
 * Card model class - Contains card data and business logic
 */
export class Card implements ICard {
    public suit: Suit;
    public rank: Rank;
    public value: number;
    public isVisible: boolean;
    private enhancement: Enhancement = Enhancement.NORMAL;
    private selectable: boolean = true;
    
    // Reference to the deck this card belongs to (can be null if not in a deck)
    private deckReference: any = null;

    constructor(suit: Suit, rank: Rank) {
        this.suit = suit;
        this.rank = rank;
        this.isVisible = false;
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
        return undefined;
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
    public flip(faceUp: boolean = true): void {
        this.isVisible = faceUp;
    }

    /**
     * Set whether the card is selectable
     * @param selectable Whether the card is selectable
     */
    public setSelectable(selectable: boolean): void {
        this.selectable = selectable;
    }

    /**
     * Check if the card is selectable
     */
    public isSelectable(): boolean {
        return this.selectable;
    }
} 