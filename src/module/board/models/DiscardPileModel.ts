import { CardModel } from './CardModel';

export class DiscardPileModel {
    private discardedCards: CardModel[];

    constructor() {
        this.discardedCards = [];
    }

    public addCard(card: CardModel): void {
        this.discardedCards.push(card);
    }

    public addCards(cards: CardModel[]): void {
        this.discardedCards.push(...cards);
    }

    public removeCard(card: CardModel): CardModel | undefined {
        const index = this.discardedCards.findIndex(c => c.id === card.id);
        if (index !== -1) {
            return this.discardedCards.splice(index, 1)[0];
        }
        return undefined;
    }

    public getDiscardedCards(): CardModel[] {
        return [...this.discardedCards];
    }

    public getDiscardedCount(): number {
        return this.discardedCards.length;
    }

    public clear(): void {
        this.discardedCards = [];
    }
}