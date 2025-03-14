import { Scene } from 'phaser';
import { CardModel } from '../models/CardModel';
import { CardView } from '../views/CardView';
import { Suit, Rank } from '../models/types';
import { DeckStyle } from '../models/DeckStyle';

export class CardController {
    private model: CardModel;
    private view: CardView;
    
    constructor(scene: Scene, x: number, y: number, suit: Suit, rank: Rank, deckStyle: DeckStyle = DeckStyle.RED) {
        // Create model
        this.model = new CardModel(suit, rank, deckStyle);
        
        // Create view
        this.view = new CardView(scene, x, y, this.model);
        
        // Add view to scene
        scene.add.existing(this.view);
    }
    
    /**
     * Get the card model
     */
    public getModel(): CardModel {
        return this.model;
    }
    
    /**
     * Get the card view
     */
    public getView(): CardView {
        return this.view;
    }
    
    /**
     * Set the position of the card
     * @param x X position
     * @param y Y position
     */
    public setPosition(x: number, y: number): void {
        this.view.setPosition(x, y);
    }
    
    /**
     * Set the depth of the card
     * @param depth Depth value
     */
    public setDepth(depth: number): void {
        this.view.setDepth(depth);
    }
    
    /**
     * Flip the card face up or face down
     * @param faceUp Whether the card should be face up
     */
    public flip(faceUp: boolean): void {
        this.model.flip(faceUp);
    }
    
    /**
     * Set whether this card is selected
     * @param selected Whether this card is selected
     */
    public setSelected(selected: boolean): void {
        this.model.setSelected(selected);
    }
    
    /**
     * Check if this card is selected
     */
    public isSelected(): boolean {
        return this.model.isCardSelected();
    }
    
    /**
     * Set whether this card can be selected
     * @param selectable Whether this card can be selected
     */
    public setSelectable(selectable: boolean): void {
        this.model.setSelectable(selectable);
    }
    
    /**
     * Check if this card can be selected
     */
    public isSelectable(): boolean {
        return this.model.isSelectable();
    }
    
    /**
     * Set the deck style for this card
     * @param style The new deck style
     */
    public setDeckStyle(style: DeckStyle): void {
        this.model.setDeckStyle(style);
    }
    
    /**
     * Destroy this card (both model and view)
     */
    public destroy(): void {
        this.view.destroy();
        // Model doesn't need explicit destruction as it has no resources to clean up
    }
} 