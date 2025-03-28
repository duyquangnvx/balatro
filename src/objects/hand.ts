import { Scene } from "phaser";
import { CardArea, CardAreaConfig, CardTransform } from "./cards/card-area";
import { PlayingCard } from "./cards/playing-card";
import { sortBySuitInternal, sortByRankInternal } from "../utils/card-helpers";

export enum SortType {
    NONE,
    BY_SUIT,
    BY_RANK
}

export class Hand extends CardArea<PlayingCard> {
    private readonly selectedCards: PlayingCard[];

    constructor(scene: Scene, config: CardAreaConfig) {
        super(scene, config);
        this.selectedCards = [];
    }
    
    /**
     * Override addCard to ensure cards are face up
     */ 
    public override addCard(card: PlayingCard): boolean {
        const added = super.addCard(card);
        if (added) {
            card.setFlipped(true);
        }

        return added;
    }

    protected override calculateCardTransformAt(index: number): CardTransform {
        const cardCount = this.cards.length;

        const maxCardSpacing = 10;
        const cardWidth = this.cards[0].width;
        const maxWidth = this.config.width;
        const gapCount = cardCount - 1;
        const totalWidthNeeded = cardWidth * cardCount;

        let cardSpacing;
        if (totalWidthNeeded > maxWidth) {
            cardSpacing = (maxWidth - totalWidthNeeded) / gapCount;
        } else {
            cardSpacing = maxCardSpacing;
        }

        const totalWidth = cardWidth * cardCount + cardSpacing * gapCount;
        const ratio = Phaser.Math.Linear(
            this.config.x - totalWidth / 2,
            this.config.x + totalWidth / 2,
            (index + 0.5) / cardCount);

        return {
            x: ratio,
            y: this.config.y,
            rotation: this.config.rotation ?? 0,
            depth: (this.config.depth ?? 0) + index
        };
    }
    
    protected override onCardClick(card: PlayingCard): void {
        this.selectCard(card);
     }
    
    public selectCard(card: PlayingCard): void {
        if (!this.cards.includes(card)) {
            return;
        }
        
        // Toggle selection
        const index = this.selectedCards.indexOf(card);
        if (index === -1) {
            this.selectedCards.push(card);
            card.liftUp();
        } else {
            this.selectedCards.splice(index, 1);
            card.lowerDown();
        }
    }

    public isCardSelected(card: PlayingCard): boolean {
        return this.selectedCards.includes(card);
    }

    public getSelectedCards(): PlayingCard[] {
        return [...this.selectedCards];
    }

    public clearSelection(): void {
        this.selectedCards.forEach(card => card.lowerDown());
        this.selectedCards.length = 0
    }

    public applySorting(sortType: SortType): void {
        switch (sortType) {
            case SortType.BY_SUIT:
                sortBySuitInternal(this.cards);
                break;
            case SortType.BY_RANK:
                sortByRankInternal(this.cards);
                break;
            default:
                // No sorting
                break;
        }
    }

    /**
     * Override removeCard để xóa target của card
     */ 
    public override removeCard(card: PlayingCard): PlayingCard | undefined {
        const removedCard = super.removeCard(card);
        if (removedCard) {
            // Remove card from selected cards if it exists
            const selectedIndex = this.selectedCards.indexOf(card);
            if (selectedIndex !== -1) {
                this.selectedCards.splice(selectedIndex, 1);
            }
        }
        return removedCard;
    }
    
    /**
     * Override clearCards để xóa tất cả target
     */
    public override clearCards(): void {
        // Xóa chọn tất cả card
        this.clearSelection();
        
        // Gọi phương thức gốc
        super.clearCards();
    }
}   