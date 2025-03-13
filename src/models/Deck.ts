import { Scene } from 'phaser';
import { Card } from './Card';
import { Suit, Rank } from './types';
import { DeckStyle } from './DeckStyle';

export class Deck {
    private cards: Card[];
    private scene: Scene;
    private totalCards: number = 52;
    private deckText: Phaser.GameObjects.Text;
    private currentStyle: DeckStyle;

    constructor(scene: Scene) {
        this.scene = scene;
        this.cards = [];
        this.currentStyle = DeckStyle.RED; // Default style
        
        // Create deck count text first
        this.deckText = this.scene.add.text(
            this.scene.cameras.main.width - 100, 
            50, 
            "0/52", // Initial text before cards are created
            { 
                fontSize: '24px', 
                color: '#ffffff' 
            }
        );
        
        // Then initialize the deck
        this.initializeDeck();
        this.shuffle();
        this.updateDeckCount(); // Update text after deck is initialized
    }

    private initializeDeck(): void {
        // Clear existing cards
        this.cards = [];
        
        // Create all 52 cards
        Object.values(Suit).forEach(suit => {
            Object.values(Rank).forEach(rank => {
                this.cards.push(new Card(this.scene, -100, -100, suit, rank, this.currentStyle)); // Off-screen initially
            });
        });
    }

    private shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public drawCard(): Card | undefined {
        const card = this.cards.pop();
        this.updateDeckCount();
        return card;
    }

    public drawCards(count: number): Card[] {
        const drawnCards: Card[] = [];
        for (let i = 0; i < count && this.cards.length > 0; i++) {
            const card = this.drawCard();
            if (card) {
                drawnCards.push(card);
            }
        }
        return drawnCards;
    }

    public returnCard(card: Card): void {
        card.flip(false);
        this.cards.push(card);
        this.updateDeckCount();
    }

    public getRemainingCards(): number {
        return this.cards.length;
    }

    private getDeckCountText(): string {
        return `${this.cards.length}/${this.totalCards}`;
    }

    private updateDeckCount(): void {
        this.deckText.setText(this.getDeckCountText());
    }

    /**
     * Get the current deck style
     */
    public getDeckStyle(): DeckStyle {
        return this.currentStyle;
    }

    /**
     * Set the current deck style
     * @param style The new deck style
     */
    public setDeckStyle(style: DeckStyle): void {
        this.currentStyle = style;
        this.refreshCardBacks();
    }

    /**
     * Refresh all face-down cards to show the current card back style
     */
    public refreshCardBacks(): void {
        this.cards.forEach(card => {
            if (!card.isVisible) {
                card.setDeckStyle(this.currentStyle);
                // Re-flip the card to update its back texture
                card.flip(false);
            }
        });
    }

    public destroy(): void {
        this.cards.forEach(card => card.destroy());
        this.deckText.destroy();
    }
} 