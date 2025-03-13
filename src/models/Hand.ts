import { Scene } from 'phaser';
import { Card } from './Card';
import { Deck } from './Deck';
import { Suit, Rank } from './types';
import EventBus from '../base/EventBus';
import { GameEvents } from '../data/GameEvents';

// Enum để theo dõi cách sắp xếp hiện tại
enum SortType {
    NONE,
    BY_SUIT,
    BY_RANK
}

export class Hand {
    private scene: Scene;
    private cards: Card[] = [];
    private deck: Deck;
    private selectedCards: Set<Card> = new Set();
    private readonly CARD_SPACING = 80;
    private readonly BOTTOM_MARGIN = 100;
    private readonly SELECTED_OFFSET = 20;
    private eventBus: EventBus;
    private currentSortType: SortType = SortType.NONE;

    constructor(scene: Scene, deck: Deck) {
        this.scene = scene;
        this.deck = deck;
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
        this.drawInitialHand();
        this.createButtons();
    }

    private setupEventListeners(): void {
        this.eventBus.on(GameEvents.CARD_SELECTED, this.onCardSelected.bind(this));
        this.eventBus.on(GameEvents.CARD_DESELECTED, this.onCardDeselected.bind(this));
    }

    private onCardSelected(card: Card): void {
        if (this.cards.includes(card)) {
            this.selectedCards.add(card);
            this.arrangeCards(); // Rearrange cards when selection changes
            this.eventBus.emit(GameEvents.HAND_UPDATED, this.getSelectedCards());
        }
    }

    private onCardDeselected(card: Card): void {
        this.selectedCards.delete(card);
        this.arrangeCards(); // Rearrange cards when selection changes
        this.eventBus.emit(GameEvents.HAND_UPDATED, this.getSelectedCards());
    }

    private createButtons(): void {
        // Discard button
        const discardButton = this.scene.add.text(
            10, 
            this.scene.cameras.main.height - 40, 
            'Discard Selected', 
            { 
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#ff0000',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();

        // Sort buttons
        const sortBySuitButton = this.scene.add.text(
            200,
            this.scene.cameras.main.height - 40,
            'Sort by Suit',
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#0000ff',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();

        const sortByRankButton = this.scene.add.text(
            350,
            this.scene.cameras.main.height - 40,
            'Sort by Rank',
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#0000ff',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();

        discardButton.on('pointerdown', () => this.discardSelectedCards());
        sortBySuitButton.on('pointerdown', () => this.sortBySuit());
        sortByRankButton.on('pointerdown', () => this.sortByRank());
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
            // Add card to scene if it's not already added
            if (!card.scene) {
                this.scene.add.existing(card);
            }
            
            // Make sure card is face up
            card.flip(true);
        });

        // Apply current sort if any
        this.applySorting();
        
        // Arrange all cards in hand
        this.arrangeCards();
        
        // Emit event after cards are added and arranged
        this.eventBus.emit(GameEvents.HAND_UPDATED, this.cards);
    }

    private onCardClick(card: Card): void {
        if (this.selectedCards.has(card)) {
            // Deselect card
            this.selectedCards.delete(card);
            card.setSelected(false);
        } else {
            // Select card
            this.selectedCards.add(card);
            card.setSelected(true);
        }
        this.arrangeCards();
    }

    private arrangeCards(): void {
        const totalWidth = (this.cards.length - 1) * this.CARD_SPACING;
        const startX = (this.scene.cameras.main.width - totalWidth) / 2;
        const baseY = this.scene.cameras.main.height - this.BOTTOM_MARGIN;

        this.cards.forEach((card, index) => {
            const x = startX + (index * this.CARD_SPACING);
            const y = baseY - (this.selectedCards.has(card) ? this.SELECTED_OFFSET : 0);
            
            // Ensure card is added to the scene if it's not already
            if (!card.scene) {
                this.scene.add.existing(card);
            }
            
            card.setPosition(x, y);
            card.setDepth(index); // Ensure proper layering
        });
    }

    private discardSelectedCards(): void {
        if (this.selectedCards.size === 0) return;

        // Store the number of cards to draw
        const numCardsToReplace = this.selectedCards.size;

        // Remove selected cards and destroy them
        this.selectedCards.forEach(card => {
            const index = this.cards.indexOf(card);
            if (index !== -1) {
                this.cards.splice(index, 1);
                card.setSelected(false); // Clear selection before destroying
                
                // Destroy the card instead of returning it to the deck
                card.destroy();
            }
        });

        // Clear selection set before drawing new cards
        this.selectedCards.clear();
        
        // Rearrange remaining cards first
        this.arrangeCards();
        
        // Draw new cards and add them to hand
        const newCards = this.deck.drawCards(numCardsToReplace);
        
        // Make sure new cards are face up before adding to hand
        newCards.forEach(card => {
            card.flip(true); // Ensure card is face up
        });
        
        // Add new cards to hand (which will apply sorting and arrange them)
        this.addCards(newCards);
    }

    // Apply the current sorting method
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

    // Internal method for sorting by suit
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

    // Internal method for sorting by rank
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

    // Public method for sorting by suit (called from UI)
    private sortBySuit(): void {
        this.currentSortType = SortType.BY_SUIT;
        this.sortBySuitInternal();
        this.arrangeCards();
    }

    // Public method for sorting by rank (called from UI)
    private sortByRank(): void {
        this.currentSortType = SortType.BY_RANK;
        this.sortByRankInternal();
        this.arrangeCards();
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
        this.eventBus.emit(GameEvents.HAND_UPDATED, this.cards);
    }

    public destroy(): void {
        this.cards.forEach(card => card.destroy());
        this.selectedCards.clear();
    }
} 