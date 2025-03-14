import { CardModel } from './CardModel';

export class HandModel {
    private cards: CardModel[] = [];
    private selectedCards: Set<CardModel> = new Set();
    private readonly MAX_CARDS = 8;

    constructor() {
        this.cards = [];
        this.selectedCards = new Set();
    }

    public addCards(newCards: CardModel[]): void {
        // Check if adding these cards would exceed the maximum
        if (this.cards.length + newCards.length > this.MAX_CARDS) {
            console.warn(`Cannot add ${newCards.length} cards. Maximum hand size is ${this.MAX_CARDS}`);
            return;
        }

        // Add cards to our collection
        this.cards.push(...newCards);
        
        // Make sure each card is face up
        newCards.forEach(card => {
            card.setFaceUp(true);
        });
    }

    public removeCard(card: CardModel): void {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            this.cards.splice(index, 1);
            this.selectedCards.delete(card);
        }
    }

    public selectCard(card: CardModel): void {
        if (this.cards.includes(card)) {
            this.selectedCards.add(card);
        }
    }

    public deselectCard(card: CardModel): void {
        this.selectedCards.delete(card);
    }

    public getCards(): CardModel[] {
        return [...this.cards];
    }

    public getSelectedCards(): CardModel[] {
        return Array.from(this.selectedCards);
    }

    public isCardSelected(card: CardModel): boolean {
        return this.selectedCards.has(card);
    }

    public getCardCount(): number {
        return this.cards.length;
    }

    public getMaxCards(): number {
        return this.MAX_CARDS;
    }

    public hasSpaceForCards(count: number): boolean {
        return this.cards.length + count <= this.MAX_CARDS;
    }

    public clear(): void {
        this.cards = [];
        this.selectedCards.clear();
    }
} 