import { DeckModel } from './DeckModel';
import { Suit, Rank, Enhancement, DeckStyle } from './types';

export class CardModel {
    private suit: Suit;
    private rank: Rank;
    private value: number;
    private faceUp: boolean;
    private enhancement: Enhancement;
    private deckModel: DeckModel;

    constructor(suit: Suit, rank: Rank, deckModel: DeckModel) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = false;
        this.value = this.calculateValue();
        this.enhancement = Enhancement.NORMAL;
    }

    private calculateValue(): number {
        switch (this.rank) {
            case Rank.ACE:
                return 11;
            case Rank.JACK:
            case Rank.QUEEN:
            case Rank.KING:
                return 10;
            default:
                return parseInt(this.rank) || 0;
        }
    }

    // Getters
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

    public getDeckStyle(): DeckStyle {
        return this.deckModel.getDeckStyle();
    }

    public getEnhancement(): Enhancement {
        return this.enhancement;
    }

    // Setters
    public setFaceUp(faceUp: boolean): void {
        this.faceUp = faceUp;
    }

    public setEnhancement(enhancement: Enhancement): void {
        this.enhancement = enhancement;
    }
} 