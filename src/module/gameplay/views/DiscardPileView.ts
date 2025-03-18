import { Scene } from 'phaser';
import { DiscardPileModel } from "../models/DiscardPileModel";
import { CardView } from "./CardView";
import { CardViewsContainer } from "./CardViewsContainer";

export class DiscardPileView extends CardViewsContainer {
    private model: DiscardPileModel;
    private readonly OFFSET = 5; // Khoảng cách giữa các lá bài trong chồng
    private readonly DISCARD_PILE_DEPTH: number;
    private readonly DISCARD_DURATION = 400;

    constructor(scene: Scene, model: DiscardPileModel, cardAreaX: number, cardAreaY: number, depth: number) {
        super(scene, cardAreaX, cardAreaY);
        this.model = model;
        this.DISCARD_PILE_DEPTH = depth;
    }

    public updateView(): void {
        this.updateCardViews();
        this.arrangeCards();
    }

    public arrangeCards(): void {
        if (this.cardViews.length === 0) return;

        const cards = this.model.getDiscardedCards();
        this.cardViews.sort((a, b) => {
            const indexA = cards.indexOf(a.getModel());
            const indexB = cards.indexOf(b.getModel());
            return indexA - indexB;
        });

        this.cardViews.forEach((cardView, index) => {
            const { targetX, targetY, targetRotation, depth } = this.getCardPropsInView(cardView);
            cardView.setPosition(targetX, targetY); 
            cardView.setDepth(depth);
            cardView.setRotation(targetRotation);
        });
    }

    /**
     * Animate a card being discarded into the discard pile
     * @param cardView The CardView to animate
     * @returns Promise that resolves when the animation completes
     */
    public async animateDiscardCard(cardView: CardView) : Promise<void> {
        if (!this.hasCardView(cardView)) {
            return;
        }
    
        const { targetX, targetY, targetRotation, depth } = this.getCardPropsInView(cardView);
        cardView.setDepth(depth);

        await Promise.all([
            cardView.animateRotateTo(targetRotation, this.DISCARD_DURATION),
            cardView.animateMoveTo(targetX, targetY, this.DISCARD_DURATION)
        ]);
    }

    private getCardPropsInView(cardView: CardView): {targetX: number, targetY: number, targetRotation: number, depth: number} {
        const index = this.cardViews.indexOf(cardView);
        const targetX = this.cardAreaX + (index * this.OFFSET);
        const targetY = this.cardAreaY;
        const targetRotation = (Math.random() - 0.5) * 0.1;
        return { targetX, targetY, targetRotation, depth: index + this.DISCARD_PILE_DEPTH };
    }
}

