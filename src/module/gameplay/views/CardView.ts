import { Scene, GameObjects } from 'phaser';
import { CardModel } from '../models/CardModel';
import { AssetManager } from '../../../managers/AssetManager';
import EventBus from '../../../base/EventBus';
import { GameEvents } from '../../../data/GameEvents';

export class CardView extends GameObjects.Container {
    private model: CardModel;
    private faceSprite: GameObjects.Sprite;
    private backSprite: GameObjects.Sprite;
    private enhancementSprite: GameObjects.Sprite;
    private border: GameObjects.Graphics;
    private shakeAnimation?: Phaser.Tweens.Tween;
    private zoomAnimation?: Phaser.Tweens.Tween;
    private initialized: boolean = false;
    private eventBus: EventBus;
    
    // Store bound listener functions so we can remove them later
    private boundListeners: {
        onCardFlipped: (card: CardModel) => void;
        onCardSelected: (card: CardModel) => void;
        onCardDeselected: (card: CardModel) => void;
        onCardEnhanced: (card: CardModel) => void;
    };

    constructor(scene: Scene, x: number, y: number, model: CardModel) {
        super(scene, 0, 0); // Initialize at 0,0 first
        this.model = model;
        this.eventBus = EventBus.getInstance();
        
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
        
        // Create bound listener functions
        this.boundListeners = {
            onCardFlipped: (card: CardModel) => {
                if (card === this.model) {
                    this.updateView();
                }
            },
            onCardSelected: (card: CardModel) => {
                if (card === this.model) {
                    this.updateBorder();
                }
            },
            onCardDeselected: (card: CardModel) => {
                if (card === this.model) {
                    this.updateBorder();
                }
            },
            onCardEnhanced: (card: CardModel) => {
                if (card === this.model) {
                    this.updateEnhancement();
                }
            }
        };
        
        // Add event listeners
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onClick, this);
        
        // Subscribe to model events
        this.setupModelListeners();
        
        // Update view based on initial model state
        this.updateView();
        
        // Now that everything is initialized, set the position
        this.initialized = true;
        this.setPosition(x, y);
    }
    
    private setupModelListeners(): void {
        // Listen for model events using the bound listeners
        this.eventBus.on(GameEvents.CARD_FLIPPED, this.boundListeners.onCardFlipped);
        this.eventBus.on(GameEvents.CARD_SELECTED, this.boundListeners.onCardSelected);
        this.eventBus.on(GameEvents.CARD_DESELECTED, this.boundListeners.onCardDeselected);
        this.eventBus.on(GameEvents.CARD_ENHANCED, this.boundListeners.onCardEnhanced);
    }
    
    private updateView(): void {
        // Update visibility based on model state
        this.faceSprite.setVisible(this.model.isVisible);
        this.backSprite.setVisible(!this.model.isVisible);
        this.enhancementSprite.setVisible(this.model.isVisible);
        
        // Update border
        this.updateBorder();
    }
    
    private updateEnhancement(): void {
        this.enhancementSprite.setTexture(AssetManager.ATLAS.ENHANCERS, this.getEnhancementFrame());
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

    /**
     * Get the frame name for the face-up card (from CARDS atlas)
     * @returns The frame name for the face-up card
     */
    private getFaceCardFrame(): string {
        return `${this.model.suit}_${this.model.rank}.png`;
    }

    /**
     * Get the frame name for the card back (from DECK atlas)
     * @returns The frame name for the card back
     */
    private getCardBackFrame(): string {
        return `${this.model.getDeckStyle()}.png`;
    }

    /**
     * Get the frame name for the enhancement sprite
     */
    private getEnhancementFrame(): string {
        return `${this.model.getEnhancement()}.png`;
    }

    /**
     * Update the border based on selection state
     */
    private updateBorder(): void {
        if (!this.initialized || !this.border) return;
        
        this.border.clear();
        
        if (this.model.isCardSelected()) {
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
        return this.model.isVisible ? this.faceSprite : this.backSprite;
    }

    public getModel(): CardModel {
        return this.model;
    }

    private onClick(): void {
        // Only allow selection if the card is selectable
        if (this.model.isSelectable()) {
            this.model.setSelected(!this.model.isCardSelected());
        }
    }

    public destroy(): void {
        // Clean up event listeners using the bound listeners
        this.eventBus.off(GameEvents.CARD_FLIPPED, this.boundListeners.onCardFlipped);
        this.eventBus.off(GameEvents.CARD_SELECTED, this.boundListeners.onCardSelected);
        this.eventBus.off(GameEvents.CARD_DESELECTED, this.boundListeners.onCardDeselected);
        this.eventBus.off(GameEvents.CARD_ENHANCED, this.boundListeners.onCardEnhanced);
        
        // Clean up animations
        this.stopShake();
        this.stopZoom();
        
        // Destroy sprites
        this.border.destroy();
        this.faceSprite.destroy();
        this.backSprite.destroy();
        this.enhancementSprite.destroy();
        
        super.destroy();
    }
} 