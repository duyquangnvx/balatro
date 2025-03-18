import { Scene } from 'phaser';
import { DeckModel } from '../models/DeckModel';
import { CardView } from './CardView';
import { CardViewsContainer } from './CardViewsContainer';
import { delay } from '../../../Utils';

/**
 * DeckView - UI representation of a Deck model
 */
export class DeckView extends CardViewsContainer {
    private model: DeckModel;
    private deckText: Phaser.GameObjects.Text;

    private readonly DECK_DEPTH: number = 0;
    private readonly RETURN_DURATION: number = 400;
    constructor(scene: Scene, model: DeckModel, cardAreaX: number, cardAreaY: number, depth: number) { 
        super(scene, cardAreaX, cardAreaY);
        this.model = model;
        this.DECK_DEPTH = depth;

        // Create deck count text
        this.deckText = scene.add.text(
            cardAreaX + 40, // Relative to deck position
            cardAreaY + 105, // Below the deck
            "0/52", 
            { 
                fontSize: '18px', 
                color: '#ffffff' 
            }
        ).setOrigin(0.5).setDepth(this.DECK_DEPTH);
    }

    /**
     * Update the deck object based on model changes
     */
    public updateView(): void {
        this.updateCardViews();

        this.updateDeckCount();
        this.arrangeCards();
    }

    private updateDeckCount(): void {
        const count = this.cardViews.length;
        const total = this.model.getTotalCards();
        this.deckText.setText(`${count}/${total}`);
    }

    // Apply 3D effect to the cards
    public arrangeCards(): void {
        this.cardViews.forEach((cardView, index) => {
            const { targetX, targetY, targetRotation, depth } = this.getCardPropsInView(cardView);
            cardView.setPosition(targetX, targetY);
            cardView.setRotation(targetRotation);
            cardView.setDepth(depth);
        });
    }

    public async animateArrangeCards(): Promise<void> {
        this.cardViews.forEach(async (cardView, index) => {
            this.animateReturnCard(cardView);
            await delay(100);
        });
    }

    public async animateReturnCard(cardView: CardView): Promise<void> {
        if (!this.hasCardView(cardView)) {
            return;
        }
        
        const { targetX, targetY, targetRotation, depth } = this.getCardPropsInView(cardView);
        cardView.setDepth(depth);

        await Promise.all([
            cardView.animateFlip(false),
            cardView.animateMoveTo(targetX, targetY, this.RETURN_DURATION),
            cardView.animateRotateTo(targetRotation, this.RETURN_DURATION)
        ]);  
    }

    private getCardPropsInView(cardView: CardView): {targetX: number, targetY: number, targetRotation: number, depth: number} {
        const index = this.cardViews.indexOf(cardView);
        const offsetX = index * 0.25;
        const offsetY = -index * 0.25;
        return {
            targetX: this.cardAreaX + offsetX,
            targetY: this.cardAreaY + offsetY,
            targetRotation: 0,
            depth: index + this.DECK_DEPTH
        }
    }

    public popTopCard(): CardView | undefined {
        const cardView = this.cardViews.pop();
        if (cardView) {
            // Card is already in the scene, no need to remove from container
            this.updateDeckCount();
        }
        return cardView;
    }

    public getModel(): DeckModel {
        return this.model;
    }

    public destroy(): void {
        super.destroy();
        this.deckText.destroy();
    }
} 