import { Scene } from "phaser";
import { CardArea, AreaProps, CardTransform } from "./card-area";
import { PlayingCardDisplay } from "../playing-card-display";
import { BoardManager } from "../../managers/board-manager";
import { PlayingCard } from "../../objects/playing-card";
import { DiscardArea } from "./discard-area";

/**
 * Area for displaying played cards
 */
export class PlayArea extends CardArea<PlayingCardDisplay> {
    constructor(scene: Scene, config: AreaProps, boardManager: BoardManager) {
        super(scene, config, boardManager);
    }

    /**
     * Override calculateCardRelativeTransformAt to arrange cards in a spread out manner
     */
    protected override calculateCardRelativeTransformAt(index: number): CardTransform {
        const cardCount = this.cardDisplays.length;
        if (cardCount === 0) {
            return {
                x: this.props.x,
                y: this.props.y,
                rotation: this.props.rotation ?? 0,
                depth: (this.props.depth ?? 0)
            };
        }

        // Arrange cards in the play area in a spread out manner
        const maxCardSpacing = 20;
        const cardWidth = this.cardDisplays[0].width;
        const maxWidth = this.props.width;
        const gapCount = cardCount - 1;
        
        // Calculate the space between cards
        let cardSpacing;
        if ((cardWidth + maxCardSpacing) * cardCount > maxWidth) {
            cardSpacing = (maxWidth - cardWidth * cardCount) / gapCount;
            if (cardSpacing < 5) cardSpacing = 5; // Minimum spacing
        } else {
            cardSpacing = maxCardSpacing;
        }

        const totalWidth = cardWidth * cardCount + cardSpacing * gapCount;
        const startX = this.props.x - totalWidth / 2 + cardWidth / 2;

        return {
            x: startX + (cardWidth + cardSpacing) * index,
            y: this.props.y,
            rotation: this.props.rotation ?? 0,
            depth: (this.props.depth ?? 0) + index
        };
    }
} 