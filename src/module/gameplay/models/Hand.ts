import { Card } from './Card';
import { Deck } from './Deck';

// Enum to track current sort type
enum SortType {
    NONE,
    BY_SUIT,
    BY_RANK
}

/**
 * Hand model class - Contains hand data and business logic
 */
export class Hand {
    private cards: Card[] = [];
    private deck: Deck;
    private selectedCards: Set<Card> = new Set();
    private currentSortType: SortType = SortType.NONE;

    constructor(deck: Deck) {
        this.deck = deck;
        this.drawInitialHand();
    }

    private drawInitialHand(): void {
        const newCards = this.deck.drawCards(8);
        this.addCards(newCards);
    }

    public addCards(cards: Card[]): void {
        // Add cards to our collection
        this.cards.push(...cards);
        
        // Ensure each card is properly set up
        cards.forEach(card => {
            // Make sure card is face up
            card.flip(true);
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
        // Sort by suit first, then by rank
        this.cards.sort((a, b) => {
            if (a.suit !== b.suit) {
                return a.suit.localeCompare(b.suit);
            }
            return a.rank.localeCompare(b.rank);
        });
    }

    private sortByRankInternal(): void {
        // Sort by rank first, then by suit
        this.cards.sort((a, b) => {
            if (a.rank !== b.rank) {
                return a.value - b.value;
            }
            return a.suit.localeCompare(b.suit);
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

    public getSelectedCards(): Card[] {
        return Array.from(this.selectedCards);
    }

    public getAllCards(): Card[] {
        return [...this.cards];
    }

    public clearSelection(): void {
        this.selectedCards.forEach(card => card.setSelected(false));
        this.selectedCards.clear();
    }

    public discardSelectedCards(): void {
        if (this.selectedCards.size === 0) return;

        // Store the number of cards to draw
        const numCardsToReplace = this.selectedCards.size;

        // Remove selected cards
        this.selectedCards.forEach(card => {
            const index = this.cards.indexOf(card);
            if (index !== -1) {
                this.cards.splice(index, 1);
                card.setSelected(false); // Clear selection
            }
        });

        // Clear the selection set
        this.selectedCards.clear();

        // Draw new cards to replace the discarded ones
        const newCards = this.deck.drawCards(numCardsToReplace);
        this.addCards(newCards);
    }

    public selectCard(card: Card): void {
        if (this.cards.includes(card) && card.isSelectable()) {
            this.selectedCards.add(card);
            card.setSelected(true);
        }
    }

    public deselectCard(card: Card): void {
        this.selectedCards.delete(card);
        card.setSelected(false);
    }

    public toggleCardSelection(card: Card): void {
        if (this.selectedCards.has(card)) {
            this.deselectCard(card);
        } else {
            this.selectCard(card);
        }
    }

    /**
     * Clean up resources
     */
    public destroy(): void {
        // No resources to clean up in the model
        this.cards = [];
        this.selectedCards.clear();
    }
} 