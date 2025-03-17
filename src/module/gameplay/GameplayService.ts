import { CardModel } from './models/CardModel';
import { DeckModel } from './models/DeckModel';
import { HandModel } from './models/HandModel';
import { DeckStyle, Enhancement } from './models/types';

/**
 * GameplayService - Singleton service to manage gameplay models
 */
export class GameplayService {
    private static instance: GameplayService;

    private deck: DeckModel;
    private playerHand: HandModel;
    private initialized: boolean = false;
    
    private readonly MAX_CARDS_IN_HAND = 8;

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
    public initialize(): void {
        if (this.initialized) { 
            return;
        }
        
        // Initialize game components
        this.deck = new DeckModel();
        this.playerHand = new HandModel();
        this.initialized = true;
    }
    
    public getDeck(): DeckModel {
        return this.deck;
    }

    public getPlayerHand(): HandModel {
        return this.playerHand;
    }

    public resetGame(): void {
        this.deck = new DeckModel();
        this.playerHand = new HandModel();
    }

    public startGame(): void {
        this.resetGame();
        this.deck.shuffle();
        this.playerHand.addCards(this.deck.drawCards(this.MAX_CARDS_IN_HAND));
    }
} 