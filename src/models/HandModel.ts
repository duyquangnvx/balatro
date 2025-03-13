import { CardModel } from './CardModel';
import { Suit, Rank } from './types';
import EventBus from '../base/EventBus';
import { GameEvents } from '../data/GameEvents';

// Enum để theo dõi cách sắp xếp hiện tại
export enum SortType {
    NONE,
    BY_SUIT,
    BY_RANK
}

export class HandModel {
    private cards: CardModel[] = [];
    private selectedCards: Set<CardModel> = new Set();
    private eventBus: EventBus;
    private currentSortType: SortType = SortType.NONE;
    private maxCards: number = 8;

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.eventBus.on(GameEvents.CARD_SELECTED, this.onCardSelected.bind(this));
        this.eventBus.on(GameEvents.CARD_DESELECTED, this.onCardDeselected.bind(this));
    }

    private onCardSelected(card: CardModel): void {
        if (this.cards.includes(card)) {
            this.selectedCards.add(card);
            this.eventBus.emit(GameEvents.HAND_UPDATED, this.getSelectedCards());
        }
    }

    private onCardDeselected(card: CardModel): void {
        this.selectedCards.delete(card);
        this.eventBus.emit(GameEvents.HAND_UPDATED, this.getSelectedCards());
    }

    /**
     * Add a card to the hand
     */
    public addCard(card: CardModel): void {
        this.cards.push(card);
        
        // Apply current sort if any
        this.applySorting();
        
        // Emit event after card is added
        this.eventBus.emit(GameEvents.HAND_UPDATED, this.cards);
    }
    
    /**
     * Add multiple cards to the hand
     */
    public addCards(cards: CardModel[]): void {
        // Add cards to our collection
        this.cards.push(...cards);
        
        // Apply current sort if any
        this.applySorting();
        
        // Emit event after cards are added
        this.eventBus.emit(GameEvents.HAND_UPDATED, this.cards);
    }
    
    /**
     * Remove a card from the hand
     */
    public removeCard(card: CardModel): void {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            this.cards.splice(index, 1);
            this.selectedCards.delete(card);
            this.eventBus.emit(GameEvents.HAND_UPDATED, this.cards);
        }
    }
    
    /**
     * Remove multiple cards from the hand
     */
    public removeCards(cards: CardModel[]): void {
        cards.forEach(card => {
            const index = this.cards.indexOf(card);
            if (index !== -1) {
                this.cards.splice(index, 1);
                this.selectedCards.delete(card);
            }
        });
        
        this.eventBus.emit(GameEvents.HAND_UPDATED, this.cards);
    }
    
    /**
     * Get all cards in the hand
     */
    public getCards(): CardModel[] {
        return [...this.cards];
    }
    
    /**
     * Get selected cards
     */
    public getSelectedCards(): CardModel[] {
        return Array.from(this.selectedCards);
    }
    
    /**
     * Clear selection
     */
    public clearSelection(): void {
        this.selectedCards.forEach(card => card.setSelected(false));
        this.selectedCards.clear();
        this.eventBus.emit(GameEvents.HAND_UPDATED, this.cards);
    }
    
    /**
     * Apply the current sorting method
     */
    private applySorting(): void {
        switch (this.currentSortType) {
            case SortType.BY_SUIT:
                this.sortBySuitInternal();
                break;
            case SortType.BY_RANK:
                this.sortByRankInternal();
                break;
            case SortType.NONE:
            default:
                // No sorting needed
                break;
        }
    }

    /**
     * Internal method for sorting by suit
     */
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

    /**
     * Internal method for sorting by rank
     */
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

    /**
     * Sort by suit
     */
    public sortBySuit(): void {
        this.currentSortType = SortType.BY_SUIT;
        this.sortBySuitInternal();
        this.eventBus.emit(GameEvents.HAND_SORTED, this.cards);
    }

    /**
     * Sort by rank
     */
    public sortByRank(): void {
        this.currentSortType = SortType.BY_RANK;
        this.sortByRankInternal();
        this.eventBus.emit(GameEvents.HAND_SORTED, this.cards);
    }
    
    /**
     * Get the current sort type
     */
    public getCurrentSortType(): SortType {
        return this.currentSortType;
    }
    
    /**
     * Get the maximum number of cards allowed in hand
     */
    public getMaxCards(): number {
        return this.maxCards;
    }
    
    /**
     * Check if the hand is full
     */
    public isFull(): boolean {
        return this.cards.length >= this.maxCards;
    }
    
    /**
     * Get the number of cards in hand
     */
    public getCardCount(): string {
        return `${this.cards.length}/${this.maxCards}`;
    }
    
    /**
     * Destroy the hand
     */
    public destroy(): void {
        // Clean up event listeners
        this.eventBus.removeAllListeners(GameEvents.CARD_SELECTED);
        this.eventBus.removeAllListeners(GameEvents.CARD_DESELECTED);
        
        // Clear collections
        this.cards = [];
        this.selectedCards.clear();
    }
} 