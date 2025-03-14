import { Scene, GameObjects } from 'phaser';
import { CardModel } from '../models/CardModel';
import { AssetManager } from '../../../managers/AssetManager';
import { GameEvents } from '../../../data/GameEvents';
import { GameplayService } from '../GameplayService';

export class CardView extends GameObjects.Container {
    private faceSprite: GameObjects.Sprite;
    private backSprite: GameObjects.Sprite;
    private enhancementSprite: GameObjects.Sprite;
    private border: GameObjects.Graphics;
    private shakeAnimation?: Phaser.Tweens.Tween;
    private zoomAnimation?: Phaser.Tweens.Tween;
    private selectable: boolean = true;
    private selected: boolean = false;
    private model: CardModel;
    private gameService: GameplayService;

    constructor(scene: Scene, model: CardModel) {
        super(scene, 0, 0);
        this.model = model;
        this.gameService = GameplayService.getInstance();
        
        // Initialize enhancement sprite first (below the card face)
        this.enhancementSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.ENHANCERS, this.getEnhancementFrame());
        this.enhancementSprite.setVisible(false);
        this.add(this.enhancementSprite);
        
        // Initialize face sprite (initially hidden)
        this.faceSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.CARDS, this.getFaceCardFrame());
        this.faceSprite.setVisible(false);
        this.add(this.faceSprite);
        
        // Initialize back sprite
        this.backSprite = scene.add.sprite(0, 0, AssetManager.ATLAS.DECK, this.getCardBackFrame());
        this.backSprite.setVisible(true);
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
        
        // Make the entire container interactive
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });
        
        // Add event listeners
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onClick, this);
    }

    private onPointerOver(): void {
        if (!this.selectable) return;
        this.singleShake();
        this.startZoom();
    }

    private onPointerOut(): void {
        this.stopZoom();
    }

    private onClick(): void {
        if (!this.selectable) return;
        
        this.gameService.toggleCardSelection(this.model);
    }

    private startZoom(): void {
        this.stopZoom();
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
        
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: 'Power1'
        });
    }

    private singleShake(): void {
        this.stopShake();
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

    public flip(faceUp: boolean = true): void {
        this.model.setFaceUp(faceUp);
        this.faceSprite.setVisible(faceUp);
        this.backSprite.setVisible(!faceUp);
        this.enhancementSprite.setVisible(faceUp);
    }

    public setSelectable(selectable: boolean): void {
        this.selectable = selectable;
    }

    public setSelected(selected: boolean): void {
        this.selected = selected;
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public updateView(): void {
        // Update visibility based on model
        this.faceSprite.setVisible(this.model.isFaceUp());
        this.backSprite.setVisible(!this.model.isFaceUp());
        this.enhancementSprite.setVisible(this.model.isFaceUp());
        
        // Update textures
        this.faceSprite.setTexture(AssetManager.ATLAS.CARDS, this.getFaceCardFrame());
        this.backSprite.setTexture(AssetManager.ATLAS.DECK, this.getCardBackFrame());
        this.enhancementSprite.setTexture(AssetManager.ATLAS.ENHANCERS, this.getEnhancementFrame());
        
        // Update selection state
        if (this.isSelected()) {
            this.border.clear();
            this.border.lineStyle(2, 0x00ff00);
            this.border.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
        } else {
            this.border.clear();
        }
    }

    public getModel(): CardModel {
        return this.model;
    }

    public getFaceCardFrame(): string {
        return `${this.model.getSuit()}_${this.model.getRank()}.png`;
    }

    public getCardBackFrame(): string {
        return `${this.model.getDeckStyle()}.png`;
    }

    public getEnhancementFrame(): string {
        return `${this.model.getEnhancement()}.png`;
    }

    public destroy(): void {
        this.stopShake();
        this.stopZoom();
        super.destroy();
    }
} 