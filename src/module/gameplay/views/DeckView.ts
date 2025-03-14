import { Scene, GameObjects } from 'phaser';
import { DeckModel } from '../models/DeckModel';
import { CardView } from './CardView';
import { CardModel } from '../models/CardModel';
import EventBus from '../../../base/EventBus';
import { GameEvents } from '../../../data/GameEvents';

export class DeckView {
    private scene: Scene;
    private model: DeckModel;
    private deckText: GameObjects.Text;
    private cardViews: Map<CardModel, CardView> = new Map();
    private deckX: number;
    private deckY: number;
    private eventBus: EventBus;

    constructor(scene: Scene, model: DeckModel) {
        this.scene = scene;
        this.model = model;
        this.eventBus = EventBus.getInstance();
        
        // Set deck position to bottom right
        this.deckX = this.scene.cameras.main.width - 100;
        this.deckY = this.scene.cameras.main.height - 120;
        
        // Create deck count text
        this.deckText = this.scene.add.text(
            this.deckX + 40, 
            this.deckY + 105, // Below the deck
            this.model.getDeckCountText(), // Get text from model
            { 
                fontSize: '18px', 
                color: '#ffffff' 
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Subscribe to model events
        this.setupModelListeners();
        
        // Create card views for all cards in the deck
        this.createCardViews();
        
        // Apply 3D effect to the deck
        this.applyDeck3DEffect();
    }
    
    private setupModelListeners(): void {
        // Listen for deck events
        this.eventBus.on(GameEvents.DECK_SHUFFLED, () => {
            this.updateDeckCount();
            this.applyDeck3DEffect();
        });
        
        this.eventBus.on(GameEvents.CARDS_DRAWN, () => {
            this.updateDeckCount();
            this.applyDeck3DEffect();
        });
        
        this.eventBus.on(GameEvents.CARD_RETURNED, (card: CardModel) => {
            // If we don't have a view for this card, create one
            if (!this.cardViews.has(card)) {
                this.createCardView(card);
            }
            
            // Update the view
            const cardView = this.cardViews.get(card);
            if (cardView) {
                cardView.setPosition(this.deckX, this.deckY);
            }
            
            this.updateDeckCount();
            this.applyDeck3DEffect();
        });
    }
    
    private createCardViews(): void {
        // Clear existing card views
        this.cardViews.forEach(view => view.destroy());
        this.cardViews.clear();
        
        // Create views for all cards in the deck
        this.model.getCards().forEach(card => {
            this.createCardView(card);
        });
    }
    
    private createCardView(card: CardModel): void {
        // Create a view for the card
        const cardView = new CardView(this.scene, this.deckX, this.deckY, card);
        
        // Add to scene and store in map
        this.scene.add.existing(cardView);
        this.cardViews.set(card, cardView);
        
        // Make sure card is not selectable in the deck
        card.setSelectable(false);
    }
    
    private updateDeckCount(): void {
        this.deckText.setText(this.model.getDeckCountText());
    }
    
    /**
     * Apply 3D effect to the top cards of the deck
     */
    private applyDeck3DEffect(): void {
        const cards = this.model.getCards();
        
        // Only apply effect to the last 15 cards (top of the deck)
        const startIndex = Math.max(0, cards.length - 15);
        
        for (let i = startIndex; i < cards.length; i++) {
            const card = cards[i];
            const cardView = this.cardViews.get(card);
            
            if (cardView) {
                // Calculate how far this card is from the bottom of the visible stack
                const stackPosition = i - startIndex;
                
                // Calculate offset based on position in the stack
                // Higher cards (higher stackPosition) get more offset
                const offsetX = stackPosition * 0.5; // 0 to 7 pixels right
                const offsetY = -stackPosition * 0.5; // 0 to -7 pixels up
                
                // Calculate rotation based on position in the stack
                // Higher cards get more rotation
                const rotation = stackPosition * 0.2 * (Math.PI / 180); // 0 to 2.8 degrees
                
                // Apply position and rotation
                cardView.setPosition(this.deckX + offsetX, this.deckY + offsetY);
                cardView.setRotation(rotation);
                
                // Ensure proper depth
                cardView.setDepth(i);
            }
        }
    }
    
    /**
     * Get a card view for a specific card model
     */
    public getCardView(card: CardModel): CardView | undefined {
        return this.cardViews.get(card);
    }
    
    /**
     * Animate drawing a card from the deck
     */
    public animateCardDraw(card: CardModel, targetX: number, targetY: number, onComplete?: () => void): void {
        const cardView = this.cardViews.get(card);
        
        if (cardView) {
            // Set a higher depth for the card being drawn
            cardView.setDepth(1000);
            
            // Emit animation started event
            this.eventBus.emit(GameEvents.CARD_ANIMATION_STARTED, card);
            
            // Create animation
            this.scene.tweens.add({
                targets: cardView,
                x: targetX,
                y: targetY,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    // Flip the card when it reaches its destination
                    card.flip(true);
                    
                    // Emit animation completed event
                    this.eventBus.emit(GameEvents.CARD_ANIMATION_COMPLETED, card);
                    
                    // Call onComplete callback if provided
                    if (onComplete) {
                        onComplete();
                    }
                }
            });
        }
    }
    
    /**
     * Destroy all resources
     */
    public destroy(): void {
        // Clean up event listeners
        this.eventBus.removeAllListeners(GameEvents.DECK_SHUFFLED);
        this.eventBus.removeAllListeners(GameEvents.CARDS_DRAWN);
        this.eventBus.removeAllListeners(GameEvents.CARD_RETURNED);
        
        // Destroy text
        this.deckText.destroy();
        
        // Destroy all card views
        this.cardViews.forEach(view => view.destroy());
        this.cardViews.clear();
    }
    
    /**
     * Get the X position of the deck
     */
    public getX(): number {
        return this.deckX;
    }
    
    /**
     * Get the Y position of the deck
     */
    public getY(): number {
        return this.deckY;
    }
} 