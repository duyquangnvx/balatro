import { Scene, GameObjects } from 'phaser';
import { DeckModel } from '../models/DeckModel';
import { CardModel } from '../models/CardModel';
import { CardView } from './CardView';
import { GameplayService } from '../GameplayService';

/**
 * DeckView - UI representation of a Deck model
 */
export class DeckView extends GameObjects.Container {
    private gameplayService: GameplayService;
    private model: DeckModel;
    private deckText: Phaser.GameObjects.Text;
    private cardViews: CardView[] = [];

    constructor(scene: Scene, model: DeckModel) { 
        // Initialize container at deck position
        super(scene);
        
        this.model = model;
        this.gameplayService = GameplayService.getInstance();
        
        // Create deck count text
        this.deckText = scene.add.text(
            40, // Relative to container position
            105, // Below the deck
            "0/52", 
            { 
                fontSize: '18px', 
                color: '#ffffff' 
            }
        ).setOrigin(0.5).setDepth(100);
        this.add(this.deckText);
        
        // Initialize card views
        this.initializeCardViews();
        
        // Add container to scene
        scene.add.existing(this);
    }

    private initializeCardViews(): void {
        // Clear existing card views
        this.cardViews.forEach(view => view.destroy());
        this.cardViews = [];
        
        // Create new card views for each card in the model
        this.model.getCards().forEach((cardModel, index) => {
            const cardView = new CardView(this.scene, cardModel);
            cardView.setPosition(this.x, this.y);
            cardView.setOnClickCallback(this.onCardClicked.bind(this));
            this.cardViews.push(cardView);
            this.add(cardView);
        });
        
        this.applyDeck3DEffect();
        this.updateDeckCount();
    }

    private onCardClicked(cardView: CardView): void {
        console.log('Card clicked:', cardView.getModel());
    }

    private applyDeck3DEffect(): void {
        // Only apply effect to the last 10 cards (top of the deck)
        const startIndex = Math.max(0, this.cardViews.length - 15);
        
        for (let i = startIndex; i < this.cardViews.length; i++) {
            // Calculate how far this card is from the bottom of the visible stack (0-9)
            const stackPosition = i - startIndex;
            
            // Calculate offset based on position in the stack
            const offsetX = stackPosition * 0.5;
            const offsetY = -stackPosition * 0.5;
            
            // Calculate rotation based on position in the stack
            const rotation = stackPosition * 0.2 * (Math.PI / 180);
            
            // Apply position and rotation
            this.cardViews[i].setPosition(this.x + offsetX, this.y + offsetY);
            this.cardViews[i].setRotation(rotation);
            this.cardViews[i].setDepth(i);
        }
    }

    private updateDeckCount(): void {
        const count = this.model.getRemainingCards();
        const total = this.model.getTotalCardsInPlay();
        this.deckText.setText(`${count}/${total}`);
    }

    /**
     * Update the deck object based on model changes
     */
    public updateView(): void {
        // Update all card views
        this.cardViews.forEach(view => view.updateView());

        this.updateDeckCount();
        this.applyDeck3DEffect();
    }

    public popTopCard(): CardView | undefined {
        const cardView = this.cardViews.pop();
        if (cardView) {
            this.remove(cardView);
            cardView.setDepth(0); // Reset depth về 0 khi rời DeckView
            this.applyDeck3DEffect();
            this.updateDeckCount();
        }
        return cardView;
    }

    public getModel(): DeckModel {
        return this.model;
    }

    public destroy(): void {
        this.cardViews.forEach(view => view.destroy());
        this.deckText.destroy();
        super.destroy();
    }
} 