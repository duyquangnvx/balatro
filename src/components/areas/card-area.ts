import { Scene } from "phaser";
import { Logger } from "../../core/logger";
import { CardDisplay } from "../card-display";
import { Card } from "../../objects/card";

export type AreaProps = {
    x: number,
    y: number,
    width: number,
    height: number,
    depth?: number,
    rotation?: number
}

export type CardTransform = {
    x: number,
    y: number,
    rotation: number,
    depth: number
}

export class CardArea<T extends CardDisplay = CardDisplay> extends Phaser.Events.EventEmitter {
    protected readonly props: AreaProps;
    protected readonly cardDisplays: T[];

    // Map of card id to target transform
    private readonly cardTargetTransforms: Map<T, CardTransform>;

    private autoArrange: boolean;

    // Lerp factor for auto arrange
    private static readonly LERP_FACTOR = 0.1;

    protected scene: Scene;

    constructor(scene: Scene, config: AreaProps) {
        super();
        this.scene = scene;
        this.cardDisplays = [];
        this.props = config;
        this.autoArrange = true;
        this.cardTargetTransforms = new Map();

        this.initializeDisplay();
    }

    protected initializeDisplay(): void {
        
    }
        
    /**
     * Add a card display to this area
     * @param cardDisplay - The card display to add
     * @returns True if the card display was added, false if the card limit was reached
     */
    public addCardDisplay(cardDisplay: T): boolean {
        this.cardDisplays.push(cardDisplay);
        this.setupCardInteraction(cardDisplay);

        return true;
    }

     /**
     * Remove a card display from this area
     * @param cardDisplay - The card display to remove
     * @returns The removed card display
     */
     public removeCardDisplay(cardDisplay: T): T | undefined {
        const index = this.cardDisplays.indexOf(cardDisplay);
        if (index === -1) {
            return undefined;
        }
        
        const removedCardDisplay = this.cardDisplays.splice(index, 1)[0];
        this.removeCardInteraction(removedCardDisplay);

        if (removedCardDisplay) {
            this.cardTargetTransforms.delete(removedCardDisplay);
        }

        return removedCardDisplay;
    }
    
    /**
     * Find a card display from this area
     * @param card - The card to find
     * @returns The card display
     */
    public findCardDisplay(card: Card): T | undefined {
        return this.cardDisplays.find(c => c.getCard() === card);
    }

    /**
     * Check if this area contains a card
     * @param card - The card to check
     * @returns True if the card is in this area, false otherwise
     */
    public containsCard(card: Card): boolean {
        return this.cardDisplays.some(c => c.getCard() === card);
    }

    /**
     * Clear all cards from this area
     */
    public clearCards(): void {
        this.cardTargetTransforms.clear();
        this.cardDisplays.length = 0;
    }

    public getCardCount(): number {
        return this.cardDisplays.length;
    }

    public updateDisplay(): void {
        this.arrangeCards();
    }

    /**
     * Force arrange cards
     */
    protected arrangeCards(): void {
        if (this.cardDisplays.length === 0) {
            return;
        }

        this.cardDisplays.forEach((card, index) => {
            const { x, y, rotation, depth } = this.calculateCardTransformAt(index);
            card.setPosition(x, y);
            card.setRotation(rotation);
            card.setDepth(depth);
        });
    }

    /**
     * Auto arrange cards with lerp, to make it look smooth.
     * Called every frame if autoArrange is true.
     */
    protected autoArrangeCards(): void {
        this.cardDisplays.forEach((card, index) => {
            const targetTransform = this.calculateCardTransformAt(index);
            
            this.cardTargetTransforms.set(card, targetTransform);

            const { x, y, rotation, depth } = targetTransform;
            
            card.x = Phaser.Math.Linear(card.x, x, CardArea.LERP_FACTOR);
            card.y = Phaser.Math.Linear(card.y, y, CardArea.LERP_FACTOR);
            
            card.rotation = Phaser.Math.Linear(card.rotation, rotation, CardArea.LERP_FACTOR);
            
            card.setDepth(depth);
        });
    }

    /**
     * Calculate the transform for a card at a given index.
     * This is used to determine the position, rotation, and depth of a card.
     * Override this in subclasses to change the arrangement logic.
     * @param index The index of the card to calculate the transform for.
     * @returns The transform for the card.
     */
    protected calculateCardTransformAt(index: number): CardTransform {
        // Default basic grid arrangement
        const cardWidth = 140 * 0.8; // Using default card dimensions and scale
        const cardHeight = 200 * 0.8;
        const padding = 10;
        
        const cols = Math.floor((this.props.width - padding) / (cardWidth + padding));
        
        const col = index % cols;
        const row = Math.floor(index / cols);

        return {
            x: this.props.x + (col * (cardWidth + padding)) - (this.props.width / 2) + (cardWidth / 2) + padding,
            y: this.props.y + (row * (cardHeight + padding)) - (this.props.height / 2) + (cardHeight / 2) + padding,
            rotation: (this.props.rotation ?? 0) + 0,
            depth: (this.props.depth ?? 0) + index
        };
    }

    private setupCardInteraction(card: T): void {
        card.on('click', this.onCardClick, this);
    }

    private removeCardInteraction(card: T): void {
        card.off('click', this.onCardClick, this);
    }

    protected onCardClick(card: T): void {
        Logger.info('Card clicked:', card);
    }
    
    public getPosition(): { x: number, y: number } {
        return { x: this.props.x, y: this.props.y };
    }

    public setPosition(x: number, y: number): void {
        this.props.x = x;
        this.props.y = y;
    }

    public setAutoArrange(autoArrange: boolean): void {
        this.autoArrange = autoArrange;
    }

    public isAutoArrange(): boolean {
        return this.autoArrange;
    }

    public update(): void {
        if (this.autoArrange) {
            this.autoArrangeCards();
        }

        for (const card of this.cardDisplays) {
            card.update();
        }
    }
}
