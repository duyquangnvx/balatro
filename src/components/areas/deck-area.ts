import { Scene } from "phaser";
import { CardArea, CardAreaConfig, CardTransform } from "./card-area";
import { PlayingCard, Rank, Suit } from "../../objects/playing-card";
import { PlayingCardDisplay } from "../playing-card-display";

export class DeckArea extends CardArea<PlayingCardDisplay> {
    private totalCards: number;

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

    public initCards(totalCards: number): void {
        this.totalCards = totalCards;

        this.clearCards();

        for (let i = 0; i < totalCards; i++) {
            const cardDisplay = new PlayingCardDisplay(this.scene);
            cardDisplay.updateDisplay();
            this.addCardDisplay(cardDisplay);
        }

        this.arrangeCards();
    }

    public shuffle(): void {
        Phaser.Utils.Array.Shuffle(this.cardDisplays);
    }

    public getCardsRemaining(): number {
        return this.cardDisplays.length;
    }

    public getTotalCards(): number {
        return this.totalCards;
    }

    public drawCard(): PlayingCardDisplay | undefined {
        return this.cardDisplays.pop();
    }
}   