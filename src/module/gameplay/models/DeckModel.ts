import { CardModel } from './CardModel';
import { DeckStyle, Rank, Suit } from './types';

/**
 * Deck model class - Contains deck data and business logic
 */
export class DeckModel {
    private remainingCards: CardModel[];
    private totalCards: number;
    private currentStyle: DeckStyle;

    constructor() {
        this.remainingCards = [];
        this.totalCards = 0;
        this.currentStyle = DeckStyle.RED; // Default style
    }

    public setCards(cards: CardModel[]) {
        this.remainingCards = cards;
        this.totalCards = cards.length;
    }

    public addCards(cards: CardModel[]): void {
        this.remainingCards.push(...cards);
        this.totalCards += cards.length;
    }

    public addCard(card: CardModel): void {
        this.remainingCards.push(card);
        this.totalCards++;
    }

    public shuffle(): void {
        for (let i = this.remainingCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.remainingCards[i], this.remainingCards[j]] = [this.remainingCards[j], this.remainingCards[i]];
        }
    }

    public drawCard(): CardModel | undefined {
        if (this.remainingCards.length === 0) {
            console.log("Deck is empty!");
            return undefined;
        }
        
        return this.remainingCards.pop();
    }

    public drawCards(count: number): CardModel[] {
        const drawnCards: CardModel[] = [];
        for (let i = 0; i < count && this.remainingCards.length > 0; i++) {
            const card = this.drawCard();
            if (card) {
                drawnCards.push(card);
            }
        }
        return drawnCards;
    }

    public getDeckStyle(): DeckStyle {
        return this.currentStyle;
    }

    public setDeckStyle(style: DeckStyle): void {
        this.currentStyle = style;
    }

    public getRemainingCards(): CardModel[] {
        return this.remainingCards;
    }

    public getRemainingCardsCount(): number {
        return this.remainingCards.length;
    }

    public getTotalCards(): number {
        return this.totalCards;
    }
    
    public clear(): void {
        this.remainingCards = [];
        this.totalCards = 0;
    }
} 