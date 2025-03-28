import { CardDisplay } from "./card-display";
import { PlayingCard } from "../objects/playing-card";

export class PlayingCardDisplay extends CardDisplay<PlayingCard> {

    protected override getCardFrontFrame(): string {
        const card = this.getCard();
        if (card === undefined) {
            return '';
        }

        return `${card.getSuit()}_${card.getRank()}.png`;
    }

    protected override getCardBackFrame(): string {
        const card = this.getCard();
        if (card === undefined) {
            return `red.png`;
        }

        // todo: Get back frame by deck type
        return `red.png`;
    }

    protected override getCardEnhancementFrame(): string {
        const card = this.getCard();
        if (card === undefined) {
            return '';
        }

        return `${card.getEnhancement()}.png`;
    }
}   