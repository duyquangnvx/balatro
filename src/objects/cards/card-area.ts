import { Scene } from "phaser";
import { Card } from "./card";
import { Logger } from "../../core/logger";

export type CardAreaConfig = {
    x: number,
    y: number,
    width: number,
    height: number,
    depth?: number,
    cardLimit?: number,
    rotation?: number
}

export type CardTransform = {
    x: number,
    y: number,
    rotation: number,
    depth: number
}

export class CardArea<T extends Card = Card> {
    protected readonly cards: T[];
    protected readonly config: CardAreaConfig;

    private autoArrange: boolean;

    // Map of card id to target transform
    private readonly cardTargetTransforms: Map<string, CardTransform>;
    // Lerp factor for auto arrange
    private static readonly LERP_FACTOR = 0.1;

    protected scene: Scene;

    constructor(scene: Scene, config: CardAreaConfig) {
        this.scene = scene;
        this.cards = [];
        this.config = config;
        this.autoArrange = false;
        this.cardTargetTransforms = new Map();

        this.initializeDisplay();
    }

    protected initializeDisplay(): void {
        
    }
        
    /**
     * Add a card to this area
     */
    public addCard(card: T): boolean {
        // Check if area has a card limit and if it's reached
        if (this.config.cardLimit !== undefined && this.cards.length >= this.config.cardLimit) {
            Logger.error("Card limit reached for this area");
            return false;
        }

        this.cards.push(card);
        this.setupCardInteraction(card);

        return true;
    }

     /**
     * Remove a card from this area
     */
     public removeCard(card: T): T | undefined {
        const index = this.cards.indexOf(card);
        if (index === -1) {
            return undefined;
        }
        
        const removedCard = this.cards.splice(index, 1)[0];
        this.removeCardInteraction(removedCard);

        if (removedCard) {
            const cardId = removedCard.getId();
            this.cardTargetTransforms.delete(cardId);
        }

        return removedCard;
    }

    /**
     * Clear all cards from this area
     */
    public clearCards(): void {
        this.cardTargetTransforms.clear();
        this.cards.length = 0;
    }
 
    /**
     * Get all cards in this area
     */
    public getCards(): Card[] {
        return [...this.cards];
    }

    /**
     * Arrange cards in a grid or other layout
     * Override in subclasses for specific arrangements
     */
    protected arrangeCards(): void {
        if (this.cards.length === 0) {
            return;
        }

        this.cards.forEach((card, index) => {
            const { x, y, rotation, depth } = this.calculateCardTransformAt(index);
            card.setPosition(x, y);
            card.setRotation(rotation);
            card.setDepth(depth);
        });
    }

    // Auto arrange cards with lerp
    protected autoArrangeCards(): void {
        this.cards.forEach((card, index) => {
            const cardId = card.getId();
            
            const targetTransform = this.calculateCardTransformAt(index);
            
            this.cardTargetTransforms.set(cardId, targetTransform);

            const { x, y, rotation, depth } = targetTransform;
            
            card.x = Phaser.Math.Linear(card.x, x, CardArea.LERP_FACTOR);
            card.y = Phaser.Math.Linear(card.y, y, CardArea.LERP_FACTOR);
            
            card.rotation = Phaser.Math.Linear(card.rotation, rotation, CardArea.LERP_FACTOR);
            
            card.setDepth(depth);
        });
    }

    protected calculateCardTransformAt(index: number): CardTransform {
        // Default basic grid arrangement
        const cardWidth = 140 * 0.8; // Using default card dimensions and scale
        const cardHeight = 200 * 0.8;
        const padding = 10;
        
        const cols = Math.floor((this.config.width - padding) / (cardWidth + padding));
        
        const col = index % cols;
        const row = Math.floor(index / cols);

        return {
            x: this.config.x + (col * (cardWidth + padding)) - (this.config.width / 2) + (cardWidth / 2) + padding,
            y: this.config.y + (row * (cardHeight + padding)) - (this.config.height / 2) + (cardHeight / 2) + padding,
            rotation: (this.config.rotation ?? 0) + 0,
            depth: (this.config.depth ?? 0) + index
        };
    }

    private setupCardInteraction(card: T): void {
        card.on('click', this.onCardClick, this);
    }

    private removeCardInteraction(card: T): void {
        card.off('click', this.onCardClick, this);
    }

    protected onCardClick(card: T): void {
        console.log('Card clicked:', card);
    }
    
    public getPosition(): { x: number, y: number } {
        return { x: this.config.x, y: this.config.y };
    }

    public setPosition(x: number, y: number): void {
        this.config.x = x;
        this.config.y = y;
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
    }
}
