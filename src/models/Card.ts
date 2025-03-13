import { ICard, Suit, Rank, Enhancement } from './types';
import { Scene, GameObjects } from 'phaser';
import { AssetManager } from '../managers/AssetManager';
import { DeckStyle } from './DeckStyle';
import EventBus from '../base/EventBus';
import { GameEvents } from '../data/GameEvents';

export class Card extends GameObjects.Container {
    private faceSprite: GameObjects.Sprite;
    private backSprite: GameObjects.Sprite;
    private enhancementSprite: GameObjects.Sprite;
    private border: GameObjects.Graphics;
    private shakeAnimation?: Phaser.Tweens.Tween;
    private zoomAnimation?: Phaser.Tweens.Tween;
    public suit: Suit;
    public rank: Rank;
    public value: number;
    public isVisible: boolean;
    private deckStyle: DeckStyle;
    private selected: boolean = false;
    private eventBus: EventBus;
    private initialized: boolean = false;
    private enhancement: Enhancement = Enhancement.NORMAL;
    private selectable: boolean = true;

    constructor(scene: Scene, x: number, y: number, suit: Suit, rank: Rank, deckStyle: DeckStyle = DeckStyle.RED) {
        super(scene, 0, 0); // Initialize at 0,0 first
        this.eventBus = EventBus.getInstance();
        this.suit = suit;
        this.rank = rank;
        this.isVisible = false;
        this.deckStyle = deckStyle;
        this.value = this.calculateValue();
        
        // Initialize enhancement sprite first (below the card face)
        this.enhancementSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.ENHANCERS, this.getEnhancementFrame());
        this.enhancementSprite.setVisible(false); // Hide initially when card is face down
        this.add(this.enhancementSprite);
        
        // Initialize face sprite (initially hidden)
        this.faceSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.CARDS, this.getFaceCardFrame());
        this.faceSprite.setVisible(false); // Hide initially
        this.add(this.faceSprite);
        
        // Initialize back sprite
        this.backSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.DECK, this.getCardBackFrame());
        this.backSprite.setVisible(true); // Show initially
        this.add(this.backSprite);
        
        // Scale enhancement sprite to match card size
        this.enhancementSprite.setScale(this.faceSprite.width / this.enhancementSprite.width);
        
        // Create border graphics (initially invisible)
        this.border = scene.add.graphics();
        this.add(this.border);
        
        // Set the size of the container based on the sprite dimensions
        const width = this.faceSprite.width;
        const height = this.faceSprite.height;
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
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onClick, this);
        this.flip(false); // Start face down

        // Now that everything is initialized, set the position
        this.initialized = true;
        this.setPosition(x, y);
    }

    /**
     * Handle pointer over event - apply shake and zoom effects
     */
    private onPointerOver(): void {
        // Always apply hover effects
        this.singleShake();
        this.startZoom();
    }

    /**
     * Handle pointer out event - reset zoom
     */
    private onPointerOut(): void {
        this.stopZoom();
    }

    /**
     * Start zoom effect
     */
    private startZoom(): void {
        // Stop any existing zoom animation
        this.stopZoom();

        // Create a new zoom animation
        this.zoomAnimation = this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            ease: 'Power1'
        });
    }

    /**
     * Stop zoom effect
     */
    private stopZoom(): void {
        if (this.zoomAnimation) {
            this.zoomAnimation.stop();
            this.zoomAnimation = undefined;
        }
        
        // Reset scale
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: 'Power1'
        });
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

    /**
     * Stop shake effect
     */
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
     * Get the frame name for the enhancement sprite
     */
    private getEnhancementFrame(): string {
        return `${this.enhancement}.png`;
    }

    /**
     * Set the deck style for this card
     * @param style The new deck style
     */
    public setDeckStyle(style: DeckStyle): void {
        this.deckStyle = style;
        // Update the back texture
        this.backSprite.setTexture(AssetManager.ATLAS.DECK, this.getCardBackFrame());
    }

    /**
     * Get the current deck style
     */
    public getDeckStyle(): DeckStyle {
        return this.deckStyle;
    }

    /**
     * Set the enhancement type for this card
     * @param enhancement The new enhancement type
     */
    public setEnhancement(enhancement: Enhancement): void {
        this.enhancement = enhancement;
        this.enhancementSprite.setTexture(AssetManager.ATLAS.ENHANCERS, this.getEnhancementFrame());
        
        // Only show enhancement when card is face up
        this.enhancementSprite.setVisible(this.isVisible);
        
        // Emit event for enhancement change
        this.eventBus.emit(GameEvents.CARD_ENHANCED, this, enhancement);
    }

    /**
     * Get the current enhancement type
     */
    public getEnhancement(): Enhancement {
        return this.enhancement;
    }

    /**
     * Flip the card face up or face down
     * @param faceUp Whether the card should be face up
     */
    public flip(faceUp: boolean = true): void {
        this.isVisible = faceUp;
        
        // Show/hide appropriate sprites
        this.faceSprite.setVisible(faceUp);
        this.backSprite.setVisible(!faceUp);
        
        // Show/hide enhancement sprite based on card face
        this.enhancementSprite.setVisible(faceUp);
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
            const width = this.faceSprite.width;
            const height = this.faceSprite.height;
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
        return this.isVisible ? this.faceSprite : this.backSprite;
    }

    public destroy(): void {
        this.stopShake();
        this.stopZoom();
        this.border.destroy();
        this.faceSprite.destroy();
        this.backSprite.destroy();
        this.enhancementSprite.destroy();
    }

    private onClick(): void {
        // Only allow selection if the card is selectable
        if (this.selectable) {
            this.setSelected(!this.selected);
        }
    }

    /**
     * Set whether this card can be selected
     * @param selectable Whether this card can be selected
     */
    public setSelectable(selectable: boolean): void {
        this.selectable = selectable;
        
        // If card is not selectable, ensure it's not selected
        if (!selectable && this.selected) {
            this.setSelected(false);
        }
    }

    /**
     * Check if this card can be selected
     */
    public isSelectable(): boolean {
        return this.selectable;
    }
} 