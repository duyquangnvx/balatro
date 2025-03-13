import { Scene } from 'phaser';
import { DeckStyle } from '../models/DeckStyle';
import { CardModel } from '../models/CardModel';
import { GameController } from '../controllers/GameController';

/**
 * GameState - Manages the overall game state
 */
export class GameState {
    private scene: Scene;
    private gameController: GameController;
    private currentDeckStyle: DeckStyle;
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.currentDeckStyle = DeckStyle.RED; // Default style
        
        // Initialize game controller
        this.gameController = new GameController(scene);
        this.gameController.setDeckStyle(this.currentDeckStyle);
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
        if (this.gameController) {
            this.gameController.setDeckStyle(this.currentDeckStyle);
        }
    }
    
    /**
     * Get the game controller
     */
    public getGameController(): GameController {
        return this.gameController;
    }
    
    /**
     * Get the selected cards from the player's hand
     */
    public getSelectedCards(): CardModel[] {
        return this.gameController.getSelectedCards();
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        this.gameController.destroy();
    }
} 