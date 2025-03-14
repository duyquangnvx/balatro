import { Scene } from 'phaser';
import { DeckModel } from '../models/DeckModel';
import { DeckView } from '../views/DeckView';
import { CardModel } from '../models/CardModel';
import { CardController } from './CardController';
import { DeckStyle } from '../models/DeckStyle';

export class DeckController {
    private model: DeckModel;
    private view: DeckView;
    private scene: Scene;
    
    constructor(scene: Scene) {
        this.scene = scene;
        
        // Create model
        this.model = new DeckModel();
        
        // Create view
        this.view = new DeckView(scene, this.model);
    }
    
    /**
     * Get the deck model
     */
    public getModel(): DeckModel {
        return this.model;
    }
    
    /**
     * Get the deck view
     */
    public getView(): DeckView {
        return this.view;
    }
    
    /**
     * Shuffle the deck
     */
    public shuffle(): void {
        this.model.shuffle();
    }
    
    /**
     * Draw a card from the deck
     */
    public drawCard(): CardController | undefined {
        const cardModel = this.model.drawCard();
        
        if (cardModel) {
            // Create a new card controller
            const cardController = new CardController(
                this.scene,
                this.view.getX(),
                this.view.getY(),
                cardModel.suit,
                cardModel.rank,
                this.model.getDeckStyle()
            );
            
            return cardController;
        }
        
        return undefined;
    }
    
    /**
     * Draw multiple cards from the deck
     */
    public drawCards(count: number): CardController[] {
        const cardModels = this.model.drawCards(count);
        const cardControllers: CardController[] = [];
        
        cardModels.forEach(cardModel => {
            // Create a new CardController for each drawn card
            const cardController = new CardController(
                this.scene,
                0, 0, // Position will be set by animation
                cardModel.suit,
                cardModel.rank,
                cardModel.getDeckStyle()
            );
            
            cardControllers.push(cardController);
        });
        
        return cardControllers;
    }
    
    /**
     * Draw a card with animation
     */
    public drawCardWithAnimation(targetX: number, targetY: number, onComplete?: (card: CardController) => void): CardController | undefined {
        const cardModel = this.model.drawCard();
        
        if (cardModel) {
            // Get the card view from the deck view
            const cardView = this.view.getCardView(cardModel);
            
            if (cardView) {
                // Create a new CardController for the drawn card
                const cardController = new CardController(
                    this.scene,
                    0, 0, // Position will be set by animation
                    cardModel.suit,
                    cardModel.rank,
                    cardModel.getDeckStyle()
                );
                
                // Animate the card moving from the deck to the target position
                this.view.animateCardDraw(cardModel, targetX, targetY, () => {
                    if (onComplete) {
                        onComplete(cardController);
                    }
                });
                
                return cardController;
            }
        }
        
        return undefined;
    }
    
    /**
     * Return a card to the deck
     */
    public returnCard(cardController: CardController): void {
        // Get the card model from the controller
        const cardModel = cardController.getModel();
        
        // Return the card to the deck
        this.model.returnCard(cardModel);
        
        // Destroy the card controller (view will be managed by deck view)
        cardController.destroy();
    }
    
    /**
     * Set the deck style
     */
    public setDeckStyle(style: DeckStyle): void {
        this.model.setDeckStyle(style);
    }
    
    /**
     * Get the number of cards remaining in the deck
     */
    public getRemainingCards(): number {
        return this.model.getRemainingCards();
    }
    
    /**
     * Get the current deck style
     */
    public getDeckStyle(): DeckStyle {
        return this.model.getDeckStyle();
    }
    
    /**
     * Destroy the deck
     */
    public destroy(): void {
        this.view.destroy();
    }
} 