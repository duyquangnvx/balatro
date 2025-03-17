import { Scene, GameObjects } from 'phaser';
import { Card } from '../models/Card';
import { AssetManager } from '../../../managers/AssetManager';
import { GameplayService } from '../GameplayService';

/**
 * CardObject - UI representation of a Card model
 */
export class CardObject extends GameObjects.Container {
    private card: Card;
    private faceSprite: GameObjects.Sprite;
    private backSprite: GameObjects.Sprite;
    private enhancementSprite: GameObjects.Sprite;
    private border: GameObjects.Graphics;
    private shakeAnimation?: Phaser.Tweens.Tween;
    private zoomAnimation?: Phaser.Tweens.Tween;
    private initialized: boolean = false;
    private gameplayService: GameplayService;

    constructor(scene: Scene, x: number, y: number, card: Card) {
        super(scene, 0, 0); // Initialize at 0,0 first
        this.card = card;
        this.gameplayService = GameplayService.getInstance();
        
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
        
        // Update UI based on card state
        this.updateVisibility();
        this.updateBorder();
        
        // Now that everything is initialized, set the position
        this.initialized = true;
        this.setPosition(x, y);
        
        // Add to scene
        scene.add.existing(this);
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
        return `${this.card.suit}_${this.card.rank}.png`;
    }

    /**
     * Get the frame name for the card back (from DECK atlas)
     * @returns The frame name for the card back
     */
    private getCardBackFrame(): string {
        return `${this.card.getDeckStyle()}.png`;
    }

    /**
     * Get the frame name for the enhancement sprite
     */
    private getEnhancementFrame(): string {
        return `${this.card.getEnhancement()}.png`;
    }

    /**
     * Update the border based on selection state
     */
    private updateBorder(): void {
        if (!this.initialized || !this.border) return;
        
        this.border.clear();
        
        const playerHand = this.gameplayService.getPlayerHand();
        const isSelected = playerHand?.isCardSelected(this.card) || false;
        
        if (isSelected) {
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

    /**
     * Update visibility of sprites based on card state
     */
    private updateVisibility(): void {
        const isVisible = this.card.isVisible;
        this.faceSprite.setVisible(isVisible);
        this.backSprite.setVisible(!isVisible);
        this.enhancementSprite.setVisible(isVisible);
    }

    /**
     * Update the card object based on model changes
     */
    public update(): void {
        this.updateVisibility();
        this.updateBorder();
        
        // Update textures
        this.backSprite.setTexture(AssetManager.ATLAS.DECK, this.getCardBackFrame());
        this.enhancementSprite.setTexture(AssetManager.ATLAS.ENHANCERS, this.getEnhancementFrame());
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
        return this.card.isVisible ? this.faceSprite : this.backSprite;
    }

    public getCard(): Card {
        return this.card;
    }

    private onClick(): void {
        // Only allow selection if the card is selectable
        if (this.card.isSelectable()) {
            const playerHand = this.gameplayService.getPlayerHand();
            if (playerHand) {
                playerHand.toggleCardSelection(this.card);
                this.updateBorder();
            }
        }
    }

    public destroy(): void {
        this.stopShake();
        this.stopZoom();
        super.destroy();
    }
} 