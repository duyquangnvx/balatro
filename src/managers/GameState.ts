import { Scene } from 'phaser';
import { Deck } from '../models/Deck';
import { Hand } from '../models/Hand';
import { DeckStyle } from '../models/DeckStyle';

/**
 * GameState - Manages the overall game state
 */
export class GameState {
    private scene: Scene;
    private deck: Deck;
    private playerHand: Hand;
    private currentDeckStyle: DeckStyle;
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.currentDeckStyle = DeckStyle.RED; // Default style
        
        // Initialize game components
        this.deck = new Deck(scene);
        this.deck.setDeckStyle(this.currentDeckStyle);
        this.playerHand = new Hand(scene, this.deck);
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
    public getPlayerHand(): Hand {
        return this.playerHand;
    }
    
    /**
     * Get the deck
     */
    public getDeck(): Deck {
        return this.deck;
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        this.deck.destroy();
        this.playerHand.destroy();
    }
} 