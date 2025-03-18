import { CardModel } from './CardModel';
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
    private currentSortType: SortType = SortType.BY_RANK;

    constructor() {
        this.cards = [];
        this.selectedCards = new Set();
    }

    public addCards(newCards: CardModel[]): void {
        // Add cards to our collection
        this.cards.push(...newCards);
        
         // Make sure each card is face up
        newCards.forEach(card => {
            card.setFaceUp(true);
        });

        // Apply current sort if any
        this.applySorting();
    }

    public removeCards(cards: CardModel[]): void {
        this.cards = this.cards.filter(card => !cards.includes(card));
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

    public getCurrentSortType(): SortType {
        return this.currentSortType;
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

    public clearSelection(): void {
        this.selectedCards.clear();
    }

    public getCards(): CardModel[] {
        return [...this.cards];
    }    

    public getCardCount(): number {
        return this.cards.length;
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