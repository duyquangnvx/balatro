import { Scene } from "phaser";
import { CardArea, CardAreaConfig, CardTransform } from "./cards/card-area";
import { PlayingCard, Rank, Suit } from "./cards/playing-card";

export class Deck extends CardArea<PlayingCard> {
    private totalCards: number;

    constructor(scene: Scene, config: CardAreaConfig) {
        super(scene, config);
    }

    protected override initializeDisplay(): void {
        this.clearCards();

        // Init cards
        Object.values(Suit).forEach(suit => {
            Object.values(Rank).forEach(rank => {
                const card = new PlayingCard(this.scene, suit, rank);
                this.addCard(card);
            });
        });

        this.totalCards = this.cards.length;

        this.arrangeCards();
    }

    /**
     * Override addCard to ensure cards are face down
     */ 
    public override addCard(card: PlayingCard): boolean {
        const added = super.addCard(card);
        if (added) {
            card.setFlipped(false);
        }

        return added;
    }

    protected override calculateCardTransformAt(index: number): CardTransform {
        // Display as a stack with slight offset for each card
        const offsetX = 0.3;
        const offsetY = -0.3;
        return {
            x: this.config.x + offsetX * index,
            y: this.config.y + offsetY * index,
            rotation: this.config.rotation ?? 0,
            depth: (this.config.depth ?? 0) + index
        }
    }

    public shuffle(): void {
        Phaser.Utils.Array.Shuffle(this.cards);
    }

    public getCardsRemaining(): number {
        return this.cards.length;
    }

    public getTotalCards(): number {
        return this.totalCards;
    }
}   