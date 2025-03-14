import { Scene, GameObjects } from 'phaser';
import { DeckModel } from '../models/DeckModel';
import { CardView } from './CardView';
import { GameplayService } from '../GameplayService';
export class DeckView extends GameObjects.Container {
    private gameService: GameplayService;
    private model: DeckModel;
    private cardViews: CardView[] = [];
    private deckText: GameObjects.Text;

    constructor(scene: Scene) {
        super(scene, 0, 0);
        this.gameService = GameplayService.getInstance();
        this.model = this.gameService.getDeckModel();
        
        // Create deck count text
        this.deckText = scene.add.text(
            this.x + 40, 
            this.y + 105,
            "0/52",
            { 
                fontSize: '18px', 
                color: '#ffffff' 
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Make deck interactive
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, 100, 150),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        // Add click handler
        this.on('pointerdown', this.onDeckClick, this);
        
        // Initialize card views
        this.initializeCardViews();
    }

    private onDeckClick(): void {
        
    }

    private initializeCardViews(): void {
        // Clear existing card views
        this.cardViews.forEach(view => view.destroy());
        this.cardViews = [];
        
        // Create new card views for each card in the model
        this.model.getCards().forEach((cardModel, index) => {
            const cardView = new CardView(this.scene, cardModel);
            cardView.setPosition(this.x, this.y);
            this.cardViews.push(cardView);
            this.add(cardView);
        });
        
        // Apply 3D effect
        this.applyDeck3DEffect();
        this.updateDeckCount();
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

    public updateView(): void {
        // Update all card views
        this.cardViews.forEach(view => view.updateView());
        
        // Update deck count
        this.updateDeckCount();
        
        // Re-apply 3D effect
        this.applyDeck3DEffect();
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