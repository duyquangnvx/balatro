import { CardModel } from './CardModel';
import { DeckModel } from './DeckModel';
import { Suit } from './types';
import { Rank } from './types';

// Enum to track current sort type
enum SortType {
    NONE,
    BY_SUIT,
    BY_RANK
}

/**
 * Hand model class - Contains hand data and business logic
 */
export class HandModel {
    private cards: CardModel[] = [];
    private selectedCards: Set<CardModel> = new Set();
    private currentSortType: SortType = SortType.NONE;
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

        // Apply current sort if any
        this.applySorting();
    }

    private applySorting(): void {
        // Apply the current sort type
        switch (this.currentSortType) {
            case SortType.BY_SUIT:
                this.sortBySuitInternal();
                break;
            case SortType.BY_RANK:
                this.sortByRankInternal();
                break;
            default:
                // No sorting
                break;
        }
    }

    private sortBySuitInternal(): void {
        this.cards.sort((a, b) => {
            // First sort by suit
            const suitCompare = Object.values(Suit).indexOf(a.suit) - Object.values(Suit).indexOf(b.suit);
            if (suitCompare !== 0) return suitCompare;
            
            // Then by rank within suit
            const rankA = Object.values(Rank).indexOf(a.rank);
            const rankB = Object.values(Rank).indexOf(b.rank);
            return rankA - rankB;
        });
    }

    private sortByRankInternal(): void {
        this.cards.sort((a, b) => {
            // First sort by rank
            const rankA = Object.values(Rank).indexOf(a.rank);
            const rankB = Object.values(Rank).indexOf(b.rank);
            if (rankA !== rankB) return rankA - rankB;
            
            // Then by suit
            return Object.values(Suit).indexOf(a.suit) - Object.values(Suit).indexOf(b.suit);
        });
    }

    public sortBySuit(): void {
        this.currentSortType = SortType.BY_SUIT;
        this.sortBySuitInternal();
    }

    public sortByRank(): void {
        this.currentSortType = SortType.BY_RANK;
        this.sortByRankInternal();
    }

    public selectCard(card: CardModel): void {
        if (this.cards.includes(card)) {
            this.selectedCards.add(card);
        }
    }

    public deselectCard(card: CardModel): void {
        this.selectedCards.delete(card);
    }

    public isCardSelected(card: CardModel): boolean {
        return this.selectedCards.has(card);
    }

    public getSelectedCards(): CardModel[] {
        return Array.from(this.selectedCards);
    }

    public getCards(): CardModel[] {
        return [...this.cards];
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

    public clearSelection(): void {
        this.selectedCards.clear();
    }

    /**
     * Discard selected cards and return them
     * @returns The discarded cards
     */
    public discardSelectedCards(): CardModel[] {
        if (this.selectedCards.size === 0) return [];

        const discardedCards: CardModel[] = [];

        // Remove selected cards
        this.selectedCards.forEach(card => {
            const index = this.cards.indexOf(card);
            if (index !== -1) {
                this.cards.splice(index, 1);
                discardedCards.push(card);
            }
        });

        // Clear the selection set
        this.selectedCards.clear();

        return discardedCards;
    }


    public toggleCardSelection(card: CardModel): void {
        if (this.selectedCards.has(card)) {
            this.deselectCard(card);
        } else {
            this.selectCard(card);
        }
    }

    public clear(): void {
        this.cards = [];
        this.selectedCards.clear();
    }
} 