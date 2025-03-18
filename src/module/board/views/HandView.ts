import { Scene } from 'phaser';
import { HandModel } from '../models/HandModel';
import { CardView } from './CardView';
import { CardViewsContainer } from './CardViewsContainer';

/**
 * HandView - UI representation of a Hand model
 */
export class HandView extends CardViewsContainer {
    private model: HandModel;
    private readonly CARD_SPACING = 80;
    private readonly ARRANGE_DURATION = 200;
    private readonly DRAW_DURATION = 200;
    private readonly HAND_DEPTH: number;
    private readonly MOVE_OFFSET = 50; // Offset for moving hand up/down

    constructor(scene: Scene, model: HandModel, cardAreaX: number, cardAreaY: number, depth: number) {
        super(scene, cardAreaX, cardAreaY);
        this.model = model;
        this.HAND_DEPTH = depth;
    }

    /**
     * Move the hand view down with animation
     * @returns Promise that resolves when the animation is complete
     */
    public async animateMoveDown(): Promise<void> {
        const newY = this.cardAreaY + this.MOVE_OFFSET;
        this.cardAreaY = newY;

        const animatePromises = this.cardViews.map(cardView => {
            return cardView.animateMoveTo(cardView.x, newY, 300);
        });

        await Promise.all(animatePromises);
    }

    /**
     * Move the hand view back up with animation
     * @returns Promise that resolves when the animation is complete
     */
    public async animateMoveUp(): Promise<void> {
        const newY = this.cardAreaY - this.MOVE_OFFSET;
        this.cardAreaY = newY;

        const animatePromises = this.cardViews.map(cardView => {
            return cardView.animateMoveTo(cardView.x, newY, 300);
        });

        await Promise.all(animatePromises);
    }

    protected override onCardClicked(cardView: CardView): void {
        const card = cardView.getModel();
        this.model.toggleCardSelection(card);
        
        const isSelected = this.model.isCardSelected(card);
        if (isSelected) {
            cardView.liftUp();
        } else {
            cardView.lowerDown();
        }     
    }

    public override addCardView(cardView: CardView): void {
        super.addCardView(cardView);
        this.sortCardViews();
    }

    /**
     * Update the hand object based on model changes
     */
    public updateView(): void {
        this.updateCardViews();
        
        this.sortCardViews();

        // Rearrange cards without animation for regular updates
        this.arrangeCards();
    }

    public sortCardViews(): void {
        const cards = this.model.getCards();
        const sortedCardViews = this.cardViews.sort((a, b) => {
            const indexA = cards.indexOf(a.getModel());
            const indexB = cards.indexOf(b.getModel());
            return indexA - indexB;
        });
        this.cardViews = sortedCardViews;
    }

    public arrangeCards(): void {
        this.cardViews.forEach((cardView, index) => {
            const { targetX, targetY, targetRotation, depth } = this.getCardPropsInView(cardView);  
            cardView.setPosition(targetX, targetY);
            cardView.setDepth(depth);
            cardView.setRotation(targetRotation);
        });
    }

    public async animateArrangeCards(useRotation: boolean = true): Promise<void> {
        const animatePromises = this.cardViews.map(cardView => {
            const { targetX, targetY, targetRotation, depth } = this.getCardPropsInView(cardView);
            cardView.setDepth(depth);

            return Promise.all([
                useRotation ? cardView.animateRotateTo(targetRotation, this.ARRANGE_DURATION) : Promise.resolve(),
                cardView.animateMoveTo(targetX, targetY, this.ARRANGE_DURATION)
            ]);
        });

        await Promise.all(animatePromises);
    }

    public async animateDrawCard(cardView: CardView): Promise<void> {  
        const { targetX, targetY, targetRotation, depth } = this.getCardPropsInView(cardView);
        cardView.setDepth(depth);

        await Promise.all([    
            this.animateArrangeCards(false),
            cardView.animateRotateTo(targetRotation, this.DRAW_DURATION),
            cardView.animateMoveTo(targetX, targetY, this.DRAW_DURATION)
        ]);
    }

    private getCardPropsInView(cardView: CardView): {targetX: number, targetY: number, targetRotation: number, depth: number} {
        const index = this.cardViews.indexOf(cardView);

        const totalWidth = (this.cardViews.length - 1) * this.CARD_SPACING;
        const startX = this.cardAreaX - totalWidth / 2; // Center relative to container
        const baseY = this.cardAreaY;
        const targetX = startX + (index * this.CARD_SPACING);
        const targetY = baseY;

        return {
            targetX,
            targetY,
            targetRotation: Math.PI,
            depth: index + this.HAND_DEPTH
        }
    }   

    public getModel(): HandModel {
        return this.model;
    }
} 