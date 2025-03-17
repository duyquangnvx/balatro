import { Scene } from 'phaser';
import { Card } from './models/Card';
import { Deck } from './models/Deck';
import { Hand } from './models/Hand';
import { DeckStyle, Enhancement } from './models/types';

/**
 * GameplayService - Singleton service to manage gameplay models
 */
export class GameplayService {
    private static instance: GameplayService;
    
    private scene: Scene | null = null;
    private deck: Deck | null = null;
    private playerHand: Hand | null = null;
    private currentDeckStyle: DeckStyle = DeckStyle.RED;
    
    private constructor() {
        // Private constructor to enforce singleton pattern
    }
    
    /**
     * Get the singleton instance
     */
    public static getInstance(): GameplayService {
        if (!GameplayService.instance) {
            GameplayService.instance = new GameplayService();
        }
        return GameplayService.instance;
    }
    
    /**
     * Initialize the gameplay service with a scene
     * @param scene The game scene
     */
    public initialize(scene: Scene): void {
        this.scene = scene;
        
        // Initialize game components
        this.deck = new Deck();
        this.deck.setDeckStyle(this.currentDeckStyle);
        this.playerHand = new Hand(this.deck);
    }
    
    /**
     * Get the current deck style
     */
    public getDeckStyle(): DeckStyle {
        return this.currentDeckStyle;
    }
    
    /**
     * Set the deck style and update all cards
     * @param style The new deck style
     */
    public setDeckStyle(style: DeckStyle): void {
        this.currentDeckStyle = style;
        
        // Update all cards to use the new style
        if (this.deck) {
            this.deck.setDeckStyle(this.currentDeckStyle);
        }
    }
    
    /**
     * Get the player's hand
     */
    public getPlayerHand(): Hand | null {
        return this.playerHand;
    }
    
    /**
     * Get the deck
     */
    public getDeck(): Deck | null {
        return this.deck;
    }
    
    /**
     * Get the selected cards from the player's hand
     */
    public getSelectedCards(): Card[] {
        if (!this.playerHand) return [];
        return this.playerHand.getSelectedCards();
    }
    
    /**
     * Draw a card from the deck
     */
    public drawCard(): Card | undefined {
        if (!this.deck) return undefined;
        return this.deck.drawCard();
    }
    
    /**
     * Draw multiple cards from the deck
     */
    public drawCards(count: number): Card[] {
        if (!this.deck) return [];
        return this.deck.drawCards(count);
    }
    
    /**
     * Add cards to the player's hand
     */
    public addCardsToHand(cards: Card[]): void {
        if (!this.playerHand) return;
        this.playerHand.addCards(cards);
    }
    
    /**
     * Apply enhancement to selected cards
     */
    public enhanceSelectedCards(enhancement: Enhancement): void {
        const selectedCards = this.getSelectedCards();
        selectedCards.forEach(card => {
            card.setEnhancement(enhancement);
        });
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        if (this.deck) {
            this.deck.destroy();
        }
        
        if (this.playerHand) {
            this.playerHand.destroy();
        }
        
        this.deck = null;
        this.playerHand = null;
        this.scene = null;
    }
    
    /**
     * Reset the service (for testing or game restart)
     */
    public static reset(): void {
        if (GameplayService.instance) {
            GameplayService.instance.destroy();
        }
        GameplayService.instance = new GameplayService();
    }
} 