import { ICard, Suit, Rank, Enhancement, DeckStyle } from './types';

/**
 * Card model class - Contains card data and business logic
 */
export class Card implements ICard {
    public suit: Suit;
    public rank: Rank;
    public value: number;
    public isVisible: boolean;
    private enhancement: Enhancement = Enhancement.NORMAL;
    private deckStyle: DeckStyle;
    private selectable: boolean = true;

    constructor(suit: Suit, rank: Rank, deckStyle: DeckStyle = DeckStyle.RED) {
        this.suit = suit;
        this.rank = rank;
        this.isVisible = false;
        this.deckStyle = deckStyle;
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
     * Set the deck style for this card
     * @param style The new deck style
     */
    public setDeckStyle(style: DeckStyle): void {
        this.deckStyle = style;
    }

    /**
     * Get the current deck style
     */
    public getDeckStyle(): DeckStyle {
        return this.deckStyle;
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