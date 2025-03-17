import { Scene, GameObjects } from 'phaser';
import { CardModel } from '../models/CardModel';
import { AssetManager } from '../../../managers/AssetManager';
import { GameplayService } from '../GameplayService';
import { HandView } from './HandView';

/**
 * CardView - UI representation of a Card model
 */
export class CardView extends GameObjects.Container {
    private gameplayService: GameplayService;
    private model: CardModel;
    private faceSprite: GameObjects.Sprite;
    private backSprite: GameObjects.Sprite;
    private enhancementSprite: GameObjects.Sprite;
    private shakeAnimation?: Phaser.Tweens.Tween;
    private zoomAnimation?: Phaser.Tweens.Tween;
    private liftAnimation?: Phaser.Tweens.Tween;
    private handView?: HandView;
    private originalY: number = 0;

    private onClickCallback: (cardView: CardView) => void;

    constructor(scene: Scene, model: CardModel) {
        super(scene, 0, 0);
        this.model = model;
        this.gameplayService = GameplayService.getInstance();
        
        // Initialize enhancement sprite first (below the card face)
        this.enhancementSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.ENHANCERS, this.getEnhancementFrame());
        this.enhancementSprite.setVisible(false);
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
    }

    /**
     * Set the hand object reference
     */
    public setHandObject(handView: HandView): void {
        this.handView = handView;
    }

    public setOnClickCallback(callback: (cardView: CardView) => void): void {
        this.onClickCallback = callback;
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

    private onClick(): void {
        if (this.onClickCallback) {
            this.onClickCallback(this);
        }
    }

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

    /**
     * Animate card lifting up when selected
     */
    public liftUp(): void {
        // Stop any existing lift animation
        this.stopLift();
        
        // Store original Y position if not already stored
        if (this.originalY === 0) {
            this.originalY = this.y + 20; // Add offset since the card might already be lifted
        }
        
        // Create a new lift animation
        this.liftAnimation = this.scene.tweens.add({
            targets: this,
            y: this.originalY - 20, // Lift up by 20 pixels
            duration: 200,
            ease: 'Back.easeOut'
        });
    }
    
    /**
     * Animate card lowering down when unselected
     */
    public lowerDown(): void {
        // Stop any existing lift animation
        this.stopLift();
        
        // Ensure we have a valid originalY
        if (this.originalY === 0) {
            this.originalY = this.y; // Use current Y as base if not set
        }
        
        // Create a new lower animation
        this.liftAnimation = this.scene.tweens.add({
            targets: this,
            y: this.originalY,
            duration: 200,
            ease: 'Back.easeIn'
        });
    }
    
    /**
     * Stop lift/lower animation
     */
    private stopLift(): void {
        if (this.liftAnimation) {
            this.liftAnimation.stop();
            this.liftAnimation = undefined;
        }
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

    
    public setPosition(x: number, y: number): this {
        // Store original Y position for animation reference if not already set
        if (this.originalY === 0) {
            this.originalY = y;
        }
        
        // Check if card is currently selected
        if (this.handView) {
            const handModel = this.handView.getModel();
            const isSelected = handModel.isCardSelected(this.model) || false;

            // If card is selected, adjust the y position to maintain the lifted state
       
            const adjustedY = isSelected ? y - 20 : y;
            // Set position with potentially adjusted Y
            super.setPosition(x, adjustedY);

            // Check if card is already selected and apply animation if this is the first positioning
            if (isSelected && this.liftAnimation === undefined) {
                this.liftUp();
            }

            return this;
        }

        super.setPosition(x, y);
        
        return this;
    }

    /**
     * Update the card view based on model changes
     */
    public updateView(): void {
         // Update visibility based on model
        const isFaceUp = this.model.isFaceUp();
        this.faceSprite.setVisible(isFaceUp);
        this.backSprite.setVisible(!isFaceUp);
        this.enhancementSprite.setVisible(isFaceUp);
        
        // Update textures
        this.faceSprite.setTexture(AssetManager.ATLAS.CARDS, this.getFaceCardFrame());
        this.backSprite.setTexture(AssetManager.ATLAS.DECK, this.getCardBackFrame());
        this.enhancementSprite.setTexture(AssetManager.ATLAS.ENHANCERS, this.getEnhancementFrame());
    }

    public getModel(): CardModel {
        return this.model;
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
        // Get deck style from card, or use default if not available
        const deckStyle = this.model.getDeckStyle();
        return `${deckStyle}.png`;
    }

    /**
     * Get the frame name for the enhancement sprite
     */
    private getEnhancementFrame(): string {
        return `${this.model.getEnhancement()}.png`;
    }

    public destroy(): void {
        this.stopShake();
        this.stopZoom();
        this.stopLift();
        super.destroy();
    }
} 