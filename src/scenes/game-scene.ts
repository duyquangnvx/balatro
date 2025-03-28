import { Rank } from "../objects/cards/playing-card";
import { Suit } from "../objects/cards/playing-card";
import { PlayingCard } from "../objects/cards/playing-card";
import { Deck } from "../objects/deck";
import { Hand, SortType } from "../objects/hand";
import { BaseScene } from "./base-scene";

export class GameScene extends BaseScene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload(): void {
        super.preload();

        this.load.image('background', 'images/bg.png');
        
        this.load.atlas('card-fronts', 'atlases/card-fronts.png', 'atlases/card-fronts.json');
        this.load.atlas('card-backs', 'atlases/card-backs.png', 'atlases/card-backs.json');
        this.load.atlas('card-enhancements', 'atlases/card-enhancements.png', 'atlases/card-enhancements.json');
    }

    private hand: Hand;

    create(): void {
        // Create a background
        const width = this.cameras.main.width;  
        const height = this.cameras.main.height;
        this.add.image(width / 2, height / 2, 'background');

        // Create a deck
        const deck = new Deck(this, {
            x: 300,
            y: 200,
            width: 100,
            height: 100,
            depth: 1
        });

        // Create a hand
        const hand = new Hand(this, {
            x: this.cameras.main.width / 2,
            y: 300,
            width: 600,
            height: 100,
            depth: 2
        });
        hand.setAutoArrange(true);


        
    }

    update(): void {
        // Gọi update của hand để card di chuyển mượt mà
        this.hand.update();
    }
}   
