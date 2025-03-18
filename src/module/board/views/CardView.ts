import { Scene, GameObjects } from 'phaser';
import { CardModel } from '../models/CardModel';
import { AssetManager } from '../../../managers/AssetManager';

/**
 * CardView - UI representation of a Card model
 */
export class CardView extends GameObjects.Container {
    private model: CardModel;
    private faceSprite: GameObjects.Sprite;
    private backSprite: GameObjects.Sprite;
    private enhancementSprite: GameObjects.Sprite;
    private cardContainer: GameObjects.Container;
    private shakeAnimation?: Phaser.Tweens.Tween;
    private zoomAnimation?: Phaser.Tweens.Tween;
    private liftAnimation?: Phaser.Tweens.Tween;
    private flipAnimation?: Phaser.Tweens.Tween;
    private moveAnimation?: Phaser.Tweens.Tween;
    private rotateAnimation?: Phaser.Tweens.Tween;
    private onClickCallback: ((cardView: CardView) => void) | null;

    private static readonly LIFT_UP_OFFSET = 20;
    private static readonly FLIP_DURATION = 300;

    constructor(scene: Scene, model: CardModel) {
        super(scene, 0, 0);
        this.model = model;
        
        // Create a child container to hold all card elements
        this.cardContainer = scene.add.container(0, 0);
        this.add(this.cardContainer);
        
        // Initialize enhancement sprite first (below the card face)
        this.enhancementSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.ENHANCERS, this.getEnhancementFrame());
        this.enhancementSprite.setVisible(false);
        this.cardContainer.add(this.enhancementSprite);
        
        // Initialize face sprite (initially hidden)
        this.faceSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.CARDS, this.getFaceCardFrame());
        this.faceSprite.setVisible(false); // Hide initially
        this.cardContainer.add(this.faceSprite);
        
        // Initialize back sprite
        this.backSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.DECK, this.getCardBackFrame());
        this.backSprite.setVisible(true); // Show initially
        this.cardContainer.add(this.backSprite);
        
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
        
        // Add container to scene
        scene.add.existing(this);
    }

    public setOnClickCallback(callback: ((cardView: CardView) => void) | null): void {
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
            targets: this.cardContainer,
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
            targets: this.cardContainer,
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

        // Create a new lift animation
        this.liftAnimation = this.scene.tweens.add({
            targets: this.cardContainer,
            y: -CardView.LIFT_UP_OFFSET,
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
        
        // Create a new lower animation
        this.liftAnimation = this.scene.tweens.add({
            targets: this.cardContainer,
            y: 0,
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
            targets: this.cardContainer,
            x: -5,
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

    /**
     * Animate flipping the card to a specific face
     * @param faceUp True to flip to face up, false to flip to face down
     * @param delay The delay time in milliseconds before the animation starts
     * @returns Promise that resolves when the flip animation is complete
     */
    public async animateFlip(faceUp: boolean, delay: number = 0): Promise<void> {
        // Stop any existing flip animation
        this.stopFlip();

        return new Promise((resolve) => {
            // Ensure card is not interactive during animation
            this.setInteractive(false);

            // First half of flip: shrink
            this.flipAnimation = this.scene.tweens.add({
                targets: this.cardContainer,
                scaleX: 0,
                duration: CardView.FLIP_DURATION / 2,
                ease: 'Power2',
                delay: delay,
                onComplete: () => {
                    // Set the specified face state at midpoint
                    this.model.setFaceUp(faceUp);
                    this.updateView();

                    // Second half of flip: expand
                    this.flipAnimation = this.scene.tweens.add({
                        targets: this.cardContainer,
                        scaleX: 1,
                        duration: CardView.FLIP_DURATION / 2,
                        ease: 'Power2',
                        onComplete: () => {
                            // Clean up
                            this.flipAnimation = undefined;
                            this.setInteractive(true);
                            resolve();
                        }
                    });
                }
            });
        });
    }

    /**
     * Stop the current flip animation if it exists
     */
    private stopFlip(): void {
        if (this.flipAnimation) {
            this.flipAnimation.stop();
            this.flipAnimation = undefined;
            // Reset scale to normal if interrupted
            this.cardContainer.scaleX = 1;
            this.setInteractive(true);
        }
    }
    

    public async animateMoveTo(targetX: number, targetY: number, duration: number = 500): Promise<void> {
        this.stopMove();
        
        return new Promise<void>((resolve) => {
            this.moveAnimation = this.scene.tweens.add({
                targets: this,
                x: targetX,
                y: targetY,
                duration: duration,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    public async animateRotateTo(targetRotation: number, duration: number = 500): Promise<void> {
        this.stopRotate();

        return new Promise<void>((resolve) => {
            this.rotateAnimation = this.scene.tweens.add({
                targets: this.cardContainer,
                rotation: targetRotation,
                duration: duration,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    public stopMove(): void {
        if (this.moveAnimation) {
            this.moveAnimation.stop();
            this.moveAnimation = undefined;
        }
    }

    private stopRotate(): void {
        if (this.rotateAnimation) {
            this.rotateAnimation.stop();
            this.rotateAnimation = undefined;
        }
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

    public setModel(model: CardModel): void {
        this.model = model;
    }

    public getModel(): CardModel {
        return this.model;
    }

    /**
     * Get the frame name for the face-up card (from CARDS atlas)
     * @returns The frame name for the face-up card
     */
    private getFaceCardFrame(): string {
        return `${this.model.getSuit()}_${this.model.getRank()}.png`;
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
        this.stopMove();
        this.stopRotate();
        this.stopFlip();
        super.destroy();
    }
} 