import { ICard, Suit, Rank } from './types';
import { Scene, GameObjects } from 'phaser';
import { AssetManager } from '../managers/AssetManager';
import { DeckStyle } from './DeckStyle';
import EventBus from '../base/EventBus';
import { GameEvents } from '../data/GameEvents';

export class Card extends GameObjects.Container {
    private sprite: GameObjects.Sprite;
    private border: GameObjects.Graphics;
    private shakeAnimation?: Phaser.Tweens.Tween;
    public suit: Suit;
    public rank: Rank;
    public value: number;
    public isVisible: boolean;
    private deckStyle: DeckStyle;
    private selected: boolean = false;
    private eventBus: EventBus;
    private initialized: boolean = false;

    constructor(scene: Scene, x: number, y: number, suit: Suit, rank: Rank, deckStyle: DeckStyle = DeckStyle.RED) {
        super(scene, 0, 0); // Initialize at 0,0 first
        this.eventBus = EventBus.getInstance();
        this.suit = suit;
        this.rank = rank;
        this.isVisible = false;
        this.deckStyle = deckStyle;
        this.value = this.calculateValue();
        
        // Initialize card sprite with back texture initially (using DECK atlas)
        this.sprite = scene.add.sprite(0, 0, AssetManager.ATLAS.DECK, this.getCardBackFrame());
        this.add(this.sprite);
        
        // Create border graphics (initially invisible)
        this.border = scene.add.graphics();
        this.add(this.border);
        
        // Set the size of the container based on the sprite dimensions
        const width = this.sprite.width;
        const height = this.sprite.height;
        this.setSize(width, height);
        
        // Make the entire container interactive with a properly centered hitArea
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                0,
                0,
                width,
                height
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true // Add hand cursor on hover
        });
        
        // Add event listeners
        this.on('pointerover', this.singleShake, this);
        this.on('pointerdown', this.onClick, this);
        this.flip(false); // Start face down

        // Now that everything is initialized, set the position
        this.initialized = true;
        this.setPosition(x, y);
    }

    private singleShake(): void {
        // Stop any existing shake animation
        this.stopShake();

        // Create a new shake animation
        this.shakeAnimation = this.scene.tweens.add({
            targets: this,
            x: this.x - 5,
            duration: 50,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.stopShake();
            }
        });
    }

    private stopShake(): void {
        if (this.shakeAnimation) {
            this.shakeAnimation.stop();
            this.shakeAnimation = undefined;
        }
    }

    private calculateValue(): number {
        switch (this.rank) {
            case Rank.ACE:
                return 11; // Ace is worth 11 points
            case Rank.JACK:
            case Rank.QUEEN:
            case Rank.KING:
                return 10; // Face cards are worth 10 points
            default:
                return parseInt(this.rank) || 0; // Number cards worth their face value
        }
    }

    /**
     * Get the appropriate texture key based on card state
     * - CARDS atlas for face-up cards
     * - DECK atlas for face-down cards
     */
    private getTextureKey(): string {
        // Use CARDS atlas for face-up cards, DECK atlas for face-down cards
        return this.isVisible ? AssetManager.ATLAS.CARDS : AssetManager.ATLAS.DECK;
    }

    /**
     * Get the appropriate frame name based on card state
     */
    private getFrameName(): string {
        return this.isVisible ? this.getFaceCardFrame() : this.getCardBackFrame();
    }

    /**
     * Get the frame name for the face-up card (from CARDS atlas)
     * @returns The frame name for the face-up card
     */
    private getFaceCardFrame(): string {
        return `${this.suit}_${this.rank}.png`;
    }

    /**
     * Get the frame name for the card back (from DECK atlas)
     * @returns The frame name for the card back
     */
    private getCardBackFrame(): string {
        return `${this.deckStyle}.png`;
    }

    /**
     * Set the deck style for this card
     * @param style The new deck style
     */
    public setDeckStyle(style: DeckStyle): void {
        this.deckStyle = style;
        // Update the texture if the card is face down
        if (!this.isVisible) {
            // Use DECK atlas for card backs
            this.sprite.setTexture(AssetManager.ATLAS.DECK, this.getCardBackFrame());
        }
    }

    /**
     * Get the current deck style
     */
    public getDeckStyle(): DeckStyle {
        return this.deckStyle;
    }

    /**
     * Flip the card face up or face down
     * @param faceUp Whether the card should be face up
     */
    public flip(faceUp: boolean = true): void {
        this.isVisible = faceUp;
        // Switch between CARDS and DECK atlas based on face up/down state
        this.sprite.setTexture(this.getTextureKey(), this.getFrameName());
    }

    /**
     * Set the card as selected or not
     * @param selected Whether the card is selected
     */
    public setSelected(selected: boolean): void {
        this.selected = selected;
        this.updateBorder();
        
        // Emit event through EventBus
        if (selected) {
            this.eventBus.emit(GameEvents.CARD_SELECTED, this);
        } else {
            this.eventBus.emit(GameEvents.CARD_DESELECTED, this);
        }
    }

    /**
     * Check if the card is selected
     */
    public isCardSelected(): boolean {
        return this.selected;
    }

    /**
     * Update the border based on selection state
     */
    private updateBorder(): void {
        if (!this.initialized || !this.border) return;
        
        this.border.clear();
        
        if (this.selected) {
            // Draw a yellow border around the card
            this.border.lineStyle(3, 0xffff00, 1);
            const width = this.sprite.width;
            const height = this.sprite.height;
            // Draw border relative to container center
            this.border.strokeRect(
                -width / 2 - 2,
                -height / 2 - 2,
                width + 4,
                height + 4
            );
        }
    }

    public setPosition(x: number, y: number): this {
        super.setPosition(x, y);
        // Only update border if initialization is complete
        if (this.initialized) {
            this.updateBorder();
        }
        return this;
    }

    public getSprite(): GameObjects.Sprite {
        return this.sprite;
    }

    public destroy(): void {
        this.stopShake();
        this.border.destroy();
        this.sprite.destroy();
    }

    private onClick(): void {
        this.setSelected(!this.selected);
    }
} 