import { Scene, GameObjects } from 'phaser';
import { HandModel } from '../models/HandModel';
import { CardView } from './CardView';
import { GameplayService } from '../GameplayService';
import { CardModel } from '../models/CardModel';
import { DeckView } from './DeckView';

/**
 * HandView - UI representation of a Hand model
 */
export class HandView extends GameObjects.Container {
    private gameplayService: GameplayService;
    private model: HandModel;
    private cardViews: CardView[] = [];
    private readonly CARD_SPACING = 80;
    private readonly BOTTOM_MARGIN = 200;

    constructor(scene: Scene, model: HandModel) {
        super(scene);
        
        this.model = model;
        this.gameplayService = GameplayService.getInstance();
        
        // Initialize card views
        this.initializeCardViews();

        scene.add.existing(this);
    }

    private initializeCardViews(): void {
        // Clear existing card views
        this.cardViews.forEach(view => view.destroy());
        this.cardViews = [];
        
        // Create new card views for each card in the model
        this.model.getCards().forEach(card => {
            const cardView = new CardView(this.scene, card);
            cardView.setPosition(0, 0);
            cardView.setOnClickCallback(this.onCardClicked.bind(this));
            cardView.updateView();
            this.cardViews.push(cardView);
            this.add(cardView);
        });
        
        // Arrange cards
        this.arrangeCards();
    }

    private onCardClicked(cardView: CardView): void {
        const cardModel = cardView.getModel();
        const wasSelected = this.model.isCardSelected(cardModel);
        this.model.toggleCardSelection(cardModel);
        
        if (wasSelected) {
            cardView.lowerDown();
        } else {
            cardView.liftUp();
        }     
    }

    public arrangeCards(animate: boolean = false): void {
        const totalWidth = (this.cardViews.length - 1) * this.CARD_SPACING;
        const startX = -totalWidth / 2; // Center relative to container
        const baseY = -this.BOTTOM_MARGIN;

        this.cardViews.forEach((cardView, index) => {
            // Find the card object for this card
            const x = startX + (index * this.CARD_SPACING);
            const y = baseY;
            
            if (animate) {
                // For animation, only animate the X position to avoid interfering with lift animation
                this.scene.tweens.add({
                    targets: cardView,
                    x: x,
                    duration: 300,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // After animation completes, ensure the Y position is correct
                        // This will respect the card's selected state
                        cardView.setPosition(cardView.x, y);
                    }
                });
            } else {
                // Immediately set position without animation
                cardView.setPosition(x, y);
            }
            
            cardView.setDepth(index); // Ensure proper layering
        });
    }

    /**
     * Update the hand object based on model changes
     */
    public updateView(): void {
        // Update all card views
        this.cardViews.forEach(view => view.updateView());
        
        // Rearrange cards without animation for regular updates
        this.arrangeCards(false);
    }

    /**
     * Animate discarding cards by moving them out to the left side of the screen step by step
     * @param discardedCards Array of CardModel objects to be discarded
     */
    public async animateDiscardCards(discardedCards: CardModel[]): Promise<void> {
        const DISCARD_X = -this.scene.sys.canvas.width; // Target X position off-screen to the left
        const ANIMATION_DURATION = 300; // Duration per card animation in ms

        // Create a map of card models to card views for quick lookup
        const discardCardSet = new Set(discardedCards);
        const cardsToDiscard = this.cardViews.filter(cardView => 
            discardCardSet.has(cardView.getModel())
        );

        // Animate each discard sequentially
        for (const cardView of cardsToDiscard) {
            await new Promise<void>((resolve) => {
                this.scene.tweens.add({
                    targets: cardView,
                    x: DISCARD_X,
                    duration: ANIMATION_DURATION,
                    ease: 'Power2',
                    onComplete: () => {
                        // Remove the card view from the array
                        const index = this.cardViews.indexOf(cardView);
                        if (index !== -1) {
                            this.cardViews.splice(index, 1);
                        }
                        
                        // Rearrange remaining cards with animation
                        this.arrangeCards(true);
                        resolve();
                    }
                });
            });
        }

        // Ensure final arrangement is correct
        this.arrangeCards(false);
    }

    public async animateDrawCards(deckView: DeckView, cards: CardModel[], delaySeconds: number = 0): Promise<void> {
        const ANIMATION_DURATION = 300;
    
        for (let i = 0; i < cards.length; i++) {
            const cardView = deckView.popTopCard();
            
            if (cardView) {
                cardView.setModel(cards[i]);
                cardView.updateView();
                
                this.cardViews.push(cardView);
                this.add(cardView);
                
                cardView.setDepth(1000);
    
                // Calculate absolute target position
                const totalWidth = (this.cardViews.length - 1) * this.CARD_SPACING;
                const startX = -totalWidth / 2;
                const targetX = this.x + startX + (this.cardViews.indexOf(cardView) * this.CARD_SPACING);
                const targetY = this.y - this.BOTTOM_MARGIN;
    
                // Animate from current position to absolute target position
                await new Promise<void>((resolve) => {
                    this.scene.tweens.add({
                        targets: cardView,
                        x: targetX,
                        y: targetY,
                        duration: ANIMATION_DURATION,
                        ease: 'Power2',
                        delay: delaySeconds * 1000 * i,
                        onStart: () => {
                            cards[i].setFaceUp(true);
                            cardView.animateFlip(true);
                        },
                        onComplete: () => {
                            cardView.setDepth(this.cardViews.indexOf(cardView));
                            resolve();
                        }
                    });
                });
    
                this.arrangeCards(true);
            }
        }
    
        this.arrangeCards(false);
    }

    public getModel(): HandModel {
        return this.model;
    }

    public destroy(): void {
        this.cardViews.forEach(view => view.destroy());
        super.destroy();
    }
} 