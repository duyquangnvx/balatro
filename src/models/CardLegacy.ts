import { Scene } from 'phaser';
import { Suit, Rank } from './types';
import { DeckStyle } from './DeckStyle';
import { CardController } from '../controllers/CardController';

/**
 * Legacy Card class that maintains the same API as the original Card class
 * but delegates to CardController internally.
 * This class is for backward compatibility during the transition.
 */
export class CardLegacy {
    private controller: CardController;
    
    constructor(scene: Scene, x: number, y: number, suit: Suit, rank: Rank, deckStyle: DeckStyle = DeckStyle.RED) {
        this.controller = new CardController(scene, x, y, suit, rank, deckStyle);
    }
    
    // Proxy all properties from the model
    get suit(): Suit {
        return this.controller.getModel().suit;
    }
    
    get rank(): Rank {
        return this.controller.getModel().rank;
    }
    
    get value(): number {
        return this.controller.getModel().value;
    }
    
    get isVisible(): boolean {
        return this.controller.getModel().isVisible;
    }
    
    // Proxy all methods to the controller
    public setPosition(x: number, y: number): this {
        this.controller.setPosition(x, y);
        return this;
    }
    
    public setDepth(depth: number): void {
        this.controller.setDepth(depth);
    }
    
    public flip(faceUp: boolean): void {
        this.controller.flip(faceUp);
    }
    
    public setSelected(selected: boolean): void {
        this.controller.setSelected(selected);
    }
    
    public isCardSelected(): boolean {
        return this.controller.isSelected();
    }
    
    public setSelectable(selectable: boolean): void {
        this.controller.setSelectable(selectable);
    }
    
    public isSelectable(): boolean {
        return this.controller.isSelectable();
    }
    
    public setDeckStyle(style: DeckStyle): void {
        this.controller.setDeckStyle(style);
    }
    
    public destroy(): void {
        this.controller.destroy();
    }
} 