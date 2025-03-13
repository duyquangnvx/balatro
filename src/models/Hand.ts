import { Scene } from 'phaser';
import { Card } from './Card';
import { Deck } from './Deck';
import { Suit, Rank } from './types';

export class Hand {
    private scene: Scene;
    private cards: Card[];
    private deck: Deck;
    private selectedCards: Set<Card>;
    private readonly CARD_SPACING = 80;
    private readonly BOTTOM_MARGIN = 100;
    private readonly SELECTED_OFFSET = 20;

    constructor(scene: Scene, deck: Deck) {
        this.scene = scene;
        this.deck = deck;
        this.cards = [];
        this.selectedCards = new Set();
        this.drawInitialHand();
        this.createButtons();
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

    private addCards(newCards: Card[]): void {
        this.cards.push(...newCards);
        this.arrangeCards();
        
        newCards.forEach(card => {
            card.flip(true);
            card.getSprite().on('pointerdown', () => this.onCardClick(card));
            // Hover effects are now handled by the Card class
        });
    }

    private arrangeCards(): void {
        const totalWidth = (this.cards.length - 1) * this.CARD_SPACING;
        const startX = (this.scene.cameras.main.width - totalWidth) / 2;
        const baseY = this.scene.cameras.main.height - this.BOTTOM_MARGIN;

        this.cards.forEach((card, index) => {
            const y = baseY - (this.selectedCards.has(card) ? this.SELECTED_OFFSET : 0);
            card.setPosition(
                startX + (index * this.CARD_SPACING),
                y
            );
        });
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

    private discardSelectedCards(): void {
        if (this.selectedCards.size === 0) return;

        // Remove and return selected cards to deck
        this.selectedCards.forEach(card => {
            const index = this.cards.indexOf(card);
            if (index !== -1) {
                this.cards.splice(index, 1);
                card.setSelected(false); // Clear selection before returning to deck
                this.deck.returnCard(card);
            }
        });

        // Draw new cards
        const newCards = this.deck.drawCards(this.selectedCards.size);
        this.selectedCards.clear();
        this.addCards(newCards);
    }

    private sortBySuit(): void {
        this.cards.sort((a, b) => {
            // First sort by suit
            const suitCompare = Object.values(Suit).indexOf(a.suit) - Object.values(Suit).indexOf(b.suit);
            if (suitCompare !== 0) return suitCompare;
            
            // Then by rank within suit
            const rankA = Object.values(Rank).indexOf(a.rank);
            const rankB = Object.values(Rank).indexOf(b.rank);
            return rankA - rankB;
        });
        
        this.arrangeCards();
    }

    private sortByRank(): void {
        this.cards.sort((a, b) => {
            // First sort by rank
            const rankA = Object.values(Rank).indexOf(a.rank);
            const rankB = Object.values(Rank).indexOf(b.rank);
            if (rankA !== rankB) return rankA - rankB;
            
            // Then by suit
            return Object.values(Suit).indexOf(a.suit) - Object.values(Suit).indexOf(b.suit);
        });
        
        this.arrangeCards();
    }

    public getCards(): Card[] {
        return [...this.cards];
    }

    public getSelectedCards(): Card[] {
        return Array.from(this.selectedCards);
    }

    public destroy(): void {
        this.cards.forEach(card => card.destroy());
        this.selectedCards.clear();
    }
} 