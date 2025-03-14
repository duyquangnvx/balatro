import { Suit, Rank, Enhancement } from './types';
import { DeckStyle } from './DeckStyle';
import EventBus from '../../../base/EventBus';
import { GameEvents } from '../../../data/GameEvents';

export class CardModel {
    public suit: Suit;
    public rank: Rank;
    public value: number;
    public isVisible: boolean;
    private deckStyle: DeckStyle;
    private selected: boolean = false;
    private selectable: boolean = true;
    private eventBus: EventBus;
    private enhancement: Enhancement = Enhancement.NORMAL;

    constructor(suit: Suit, rank: Rank, deckStyle: DeckStyle = DeckStyle.RED) {
        this.eventBus = EventBus.getInstance();
        this.suit = suit;
        this.rank = rank;
        this.isVisible = false;
        this.deckStyle = deckStyle;
        this.value = this.calculateValue();
    }

    private calculateValue(): number {
        // Convert rank to numeric value
        let value = 0;
        
        switch (this.rank) {
            case Rank.ACE:
                value = 1;
                break;
            case Rank.TWO:
                value = 2;
                break;
            case Rank.THREE:
                value = 3;
                break;
            case Rank.FOUR:
                value = 4;
                break;
            case Rank.FIVE:
                value = 5;
                break;
            case Rank.SIX:
                value = 6;
                break;
            case Rank.SEVEN:
                value = 7;
                break;
            case Rank.EIGHT:
                value = 8;
                break;
            case Rank.NINE:
                value = 9;
                break;
            case Rank.TEN:
                value = 10;
                break;
            case Rank.JACK:
                value = 11;
                break;
            case Rank.QUEEN:
                value = 12;
                break;
            case Rank.KING:
                value = 13;
                break;
        }
        
        return value;
    }

    /**
     * Flip the card face up or face down
     * @param faceUp Whether the card should be face up
     */
    public flip(faceUp: boolean): void {
        this.isVisible = faceUp;
        this.eventBus.emit(GameEvents.CARD_FLIPPED, this);
    }

    /**
     * Set whether this card is selected
     * @param selected Whether this card is selected
     */
    public setSelected(selected: boolean): void {
        if (!this.selectable && selected) {
            return; // Can't select if not selectable
        }
        
        if (this.selected !== selected) {
            this.selected = selected;
            
            // Emit appropriate event
            if (selected) {
                this.eventBus.emit(GameEvents.CARD_SELECTED, this);
            } else {
                this.eventBus.emit(GameEvents.CARD_DESELECTED, this);
            }
        }
    }

    /**
     * Check if this card is selected
     */
    public isCardSelected(): boolean {
        return this.selected;
    }

    /**
     * Set whether this card can be selected
     * @param selectable Whether this card can be selected
     */
    public setSelectable(selectable: boolean): void {
        this.selectable = selectable;
        
        // If card is not selectable, ensure it's not selected
        if (!selectable && this.selected) {
            this.setSelected(false);
        }
    }

    /**
     * Check if this card can be selected
     */
    public isSelectable(): boolean {
        return this.selectable;
    }

    /**
     * Set the enhancement for this card
     * @param enhancement The enhancement to apply
     */
    public setEnhancement(enhancement: Enhancement): void {
        this.enhancement = enhancement;
        this.eventBus.emit(GameEvents.CARD_ENHANCED, this);
    }

    /**
     * Get the current enhancement
     */
    public getEnhancement(): Enhancement {
        return this.enhancement;
    }

    /**
     * Get the deck style
     */
    public getDeckStyle(): DeckStyle {
        return this.deckStyle;
    }

    /**
     * Set the deck style
     * @param style The new deck style
     */
    public setDeckStyle(style: DeckStyle): void {
        this.deckStyle = style;
    }
} 