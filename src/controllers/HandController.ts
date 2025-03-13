import { Scene } from 'phaser';
import { HandModel, SortType } from '../models/HandModel';
import { HandView } from '../views/HandView';
import { CardModel } from '../models/CardModel';
import { CardController } from './CardController';
import { DeckController } from './DeckController';
import EventBus from '../base/EventBus';
import { GameEvents } from '../data/GameEvents';

export class HandController {
    private model: HandModel;
    private view: HandView;
    private scene: Scene;
    private deckController: DeckController;
    private eventBus: EventBus;
    
    constructor(scene: Scene, deckController: DeckController) {
        this.scene = scene;
        this.deckController = deckController;
        this.eventBus = EventBus.getInstance();
        
        // Create model
        this.model = new HandModel();
        
        // Create view
        this.view = new HandView(scene, this.model);
        
        // Draw initial hand
        this.drawInitialHand();
    }
    
    /**
     * Draw initial hand of 8 cards
     */
    private drawInitialHand(): void {
        const cardControllers = this.deckController.drawCards(8);
        this.addCards(cardControllers);
    }
    
    /**
     * Get the hand model
     */
    public getModel(): HandModel {
        return this.model;
    }
    
    /**
     * Get the hand view
     */
    public getView(): HandView {
        return this.view;
    }
    
    /**
     * Add a card to the hand
     */
    public addCard(cardController: CardController): void {
        // Add card to model
        this.model.addCard(cardController.getModel());
        
        // Add card view to hand view
        this.view.addCardView(cardController.getModel(), cardController.getView());
    }
    
    /**
     * Add multiple cards to the hand
     */
    public addCards(cardControllers: CardController[]): void {
        // Add cards to model
        const cardModels = cardControllers.map(cc => cc.getModel());
        this.model.addCards(cardModels);
        
        // Add card views to hand view
        cardControllers.forEach(cc => {
            this.view.addCardView(cc.getModel(), cc.getView());
        });
    }
    
    /**
     * Add a card to the hand with animation
     */
    public addCardWithAnimation(cardController: CardController, startX: number, startY: number): void {
        // Add card to model
        this.model.addCard(cardController.getModel());
        
        // Animate card being added to hand
        this.view.animateCardAdded(
            cardController.getModel(),
            cardController.getView(),
            startX,
            startY
        );
    }
    
    /**
     * Draw a card from the deck and add it to the hand with animation
     */
    public drawCardFromDeck(): void {
        // Check if hand is full
        if (this.model.isFull()) {
            console.log("Hand is full!");
            return;
        }
        
        // Get deck position
        const deckX = this.scene.cameras.main.width - 100;
        const deckY = this.scene.cameras.main.height - 120;
        
        // Draw card with animation
        this.deckController.drawCardWithAnimation(deckX, deckY, (cardController) => {
            // Add card to hand after animation completes
            this.addCard(cardController);
        });
    }
    
    /**
     * Discard selected cards and draw new ones
     */
    public discardAndDraw(): void {
        const selectedCards = this.model.getSelectedCards();
        if (selectedCards.length === 0) return;
        
        // Store the number of cards to draw
        const numCardsToReplace = selectedCards.length;
        
        // Remove selected cards from model
        this.model.removeCards(selectedCards);
        
        // Draw new cards and add them to hand
        const newCards = this.deckController.drawCards(numCardsToReplace);
        this.addCards(newCards);
    }
    
    /**
     * Sort cards by rank
     */
    public sortByRank(): void {
        this.model.sortByRank();
    }
    
    /**
     * Sort cards by suit
     */
    public sortBySuit(): void {
        this.model.sortBySuit();
    }
    
    /**
     * Clear selection
     */
    public clearSelection(): void {
        this.model.clearSelection();
    }
    
    /**
     * Destroy the hand
     */
    public destroy(): void {
        this.view.destroy();
        this.model.destroy();
    }
} 