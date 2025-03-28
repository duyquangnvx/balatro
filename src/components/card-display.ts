import { Scene } from "phaser";
import { Card } from "../objects/card";

/**
 * CardDisplay is a base class for all card displays.
 * It provides a common interface for all card displays.
 */
export abstract class CardDisplay<T extends Card = Card> extends Phaser.GameObjects.Container {
    private card?: T;

    // Card display
    protected readonly contentParent: Phaser.GameObjects.Container;
    protected readonly shakeParent: Phaser.GameObjects.Container;
    protected readonly frontSprite: Phaser.GameObjects.Sprite;
    protected readonly backSprite: Phaser.GameObjects.Sprite;
    protected readonly enhancementSprite: Phaser.GameObjects.Sprite;

    // Animation
    private shakeAnimation?: Phaser.Tweens.Tween;
    private zoomAnimation?: Phaser.Tweens.Tween;
    private liftAnimation?: Phaser.Tweens.Tween;
    private flipAnimation?: Phaser.Tweens.Tween;

    // Constants
    private static readonly LIFT_OFFSET = 20;
    private static readonly FLIP_DURATION = 300;

    constructor(scene: Scene, card?: T) {
        super(scene);
        scene.add.existing(this);

        this.shakeParent = scene.add.container(0, 0);
        this.add(this.shakeParent);

        this.contentParent = scene.add.container(0, 0);
        this.shakeParent.add(this.contentParent);

        // Initialize enhancement sprite first (below the card face)
        this.enhancementSprite = scene.add.sprite(0, 0,  '__DEFAULT');
        this.enhancementSprite.setVisible(false);
        this.shakeParent.add(this.enhancementSprite);

        // Initialize face sprite (initially hidden)
        this.frontSprite = scene.add.sprite(0, 0,  '__DEFAULT');
        this.frontSprite.setVisible(false); // Hide initially
        this.shakeParent.add(this.frontSprite);    

        // Initialize back sprite
        this.backSprite = scene.add.sprite(0, 0, '__DEFAULT');
        this.backSprite.setVisible(true); // Show initially
        this.shakeParent.add(this.backSprite);

        // Add event listeners
        this.on('pointerover', this.onPointerover, this);
        this.on('pointerout', this.onPointerout, this);
        this.on('pointerdown', this.onClick, this);
        this.on('pointerup', this.onPointerup, this);
        this.on('dragstart', this.onDragstart, this);
        this.on('drag', this.onDrag, this);
        this.on('dragend', this.onDragend, this);
    }

    /**
     * Handle pointer over event - apply shake and zoom effects
     */
    protected onPointerover(): void {
        this.singleShake();
        this.startZoom();
    }

    /**
     * Handle pointer out event - reset zoom
     */
    protected onPointerout(): void {
        this.stopZoom();
    }

    protected onPointerdown(): void {
        this.startZoom();

        // todo: Update shadow with smooth animation
    }

    protected onPointerup(): void {
        this.stopZoom();

        // todo: Reset depth if not selected
        // todo: Update shadow with smooth animation
    }

    protected onDragstart(): void {
        this.startZoom();

        // todo: Update shadow for dragging state
        // todo: bring to top
    }

    protected onDrag(): void {
        
    }

    protected onDragend(): void {
        this.stopZoom();

        // todo: Reset depth if not selected
        // todo: Reset shadow position
    }

    protected onClick(): void {
        this.emit('click', this);
    }

    protected singleShake(): void {
        // Stop any existing shake animation
        this.stopShake();

        // Create a new shake animation
        this.shakeAnimation = this.scene.tweens.add({
            targets: this.shakeParent,
            x: -5,
            duration: 50,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.stopShake();
            }
        });
    }

    protected stopShake(): void {
        if (this.shakeAnimation) {
            this.shakeAnimation.stop();
            this.shakeAnimation = undefined;
        }
    }

    protected startZoom(): void {
        // Stop any existing zoom animation
        this.stopZoom();

        // Create a new zoom animation
        this.zoomAnimation = this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            ease: 'Back.easeOut'
        });
    }

    protected stopZoom(): void {
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
            ease: 'Back.easeOut'
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
            targets: this.shakeParent,
            y: -CardDisplay.LIFT_OFFSET,
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
            targets: this.shakeParent,
            y: 0,
            duration: 200,
            ease: 'Back.easeIn'
        });
    }
    
    /**
     * Stop lift/lower animation
     */
    protected stopLift(): void {
        if (this.liftAnimation) {
            this.liftAnimation.stop();
            this.liftAnimation = undefined;
        }
    }

    /**
     * Animate card flipping
     * @param faceUp - Whether the card should be face up
     * @param delay - The delay before the animation starts
     */
    public async animateFlip(faceUp: boolean, delay: number = 0): Promise<void> {
        // Stop any existing flip animation
        this.stopFlip();
        
        return new Promise((resolve) => {
            // Ensure card is not interactive during animation
            this.setInteractive(false);

           // First half of flip: shrink
            this.flipAnimation = this.scene.tweens.add({
                targets: this.shakeParent,
                scaleX: 0,
                duration: CardDisplay.FLIP_DURATION / 2,
                ease: 'Power2',
                delay: delay,
                onComplete: () => {
                    // Set the specified face state at midpoint
                    this.setFlipped(faceUp);
                    this.updateDisplay();

                    // Second half of flip: expand
                    this.flipAnimation = this.scene.tweens.add({
                        targets: this.shakeParent,
                        scaleX: 1,
                        duration: CardDisplay.FLIP_DURATION / 2,
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

    private stopFlip(): void {
        if (this.flipAnimation) {
            this.flipAnimation.stop();
            this.flipAnimation = undefined;
        }   
    }

    /**
     * Update the display of the card.
     * This method should be called when the card is flipped or the textures are updated.
     */
    public updateDisplay(): void {
        this.updateTextures();    

        const flipped = this.isFlipped() || !this.isUnknown();
        this.frontSprite.setVisible(flipped);
        this.backSprite.setVisible(!flipped);
        this.enhancementSprite.setVisible(flipped);

        // Set the size of the container based on the sprite dimensions
        const width = this.backSprite.width;
        const height = this.backSprite.height;
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
    }

    public updateTextures(): void {
        this.frontSprite.setTexture('card-fronts', this.getCardFrontFrame());
        this.backSprite.setTexture('card-backs', this.getCardBackFrame());
        this.enhancementSprite.setTexture('card-enhancements', this.getCardEnhancementFrame());
    }

    public destroy(): void {
        this.stopShake();
        this.stopZoom();
        this.stopLift();
        this.stopFlip();

        this.frontSprite.destroy();
        this.backSprite.destroy();
        this.enhancementSprite.destroy();

        super.destroy();
    }
    
    public setCard(card: T): void {
        this.card = card;
    }

    public getCard(): T | undefined {
        return this.card;
    }

    public isUnknown(): boolean {
        return this.card === undefined;
    }

    /**
     * Set the flipped state of the card
     * @param flipped - The flipped state of the card
     */
    public setFlipped(flipped: boolean): void {
        this.card?.setFlipped(flipped);
    }

    /**
     * Get the flipped state of the card
     * @returns The flipped state of the card
     */
    public isFlipped(): boolean {
        return this.card?.isFlipped() ?? false;
    }  

    /**
     * Get the front frame of the card
     * @returns The front frame of the card
     */
    protected abstract getCardFrontFrame(): string;

    /**
     * Get the back frame of the card
     * @returns The back frame of the card
     */
    protected abstract getCardBackFrame(): string;

    /**
     * Get the enhancement frame of the card
     * @returns The enhancement frame of the card
     */ 
    protected abstract getCardEnhancementFrame(): string;
}