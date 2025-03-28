import { Scene } from "phaser";
import { CardArea, CardAreaConfig, CardTransform } from "./card-area";
import { PlayingCardDisplay } from "../playing-card-display";
import { sortBySuitInternal, sortByRankInternal } from "../../utils/card-helpers";

export enum SortType {
    NONE,
    BY_SUIT,
    BY_RANK
}

export class HandArea extends CardArea<PlayingCardDisplay> {
    private readonly selectedCards: PlayingCardDisplay[];

    constructor(scene: Scene, config: CardAreaConfig) {
        super(scene, config);
        this.selectedCards = [];
    }

    /**
     * Override removeCard to remove selected card
     */ 
    public override removeCardDisplay(card: PlayingCardDisplay): PlayingCardDisplay | undefined {
        const removedCard = super.removeCardDisplay(card);
        if (removedCard) {
            // Remove card from selected cards if it exists
            const selectedIndex = this.selectedCards.indexOf(card);
            if (selectedIndex !== -1) {
                this.selectedCards.splice(selectedIndex, 1);
            }
        }
        return removedCard;
    }

    protected override calculateCardTransformAt(index: number): CardTransform {
        const cardCount = this.cardDisplays.length;

        const maxCardSpacing = 10;
        const cardWidth = this.cardDisplays[0].width;
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
    
    protected override onCardClick(card: PlayingCardDisplay): void {
        this.selectCard(card);
     }
    
    public selectCard(card: PlayingCardDisplay): void {
        if (!this.cardDisplays.includes(card)) {
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
        
        this.emit('card-selected-changed', this.selectedCards);
    }

    public isCardSelected(card: PlayingCardDisplay): boolean {
        return this.selectedCards.includes(card);
    }

    public getSelectedCards(): PlayingCardDisplay[] {
        return [...this.selectedCards];
    }

    public clearSelection(): void {
        this.selectedCards.forEach(card => card.lowerDown());
        this.selectedCards.length = 0;
        
        // Emit event khi xóa hết card đã chọn
        this.emit('card-selected-changed', this.selectedCards);
    }

    /**
     * Override clearCards to remove all selected cards
     */
    public override clearCards(): void {
        super.clearCards();
        this.clearSelection(); 
    }

    public applySorting(sortType: SortType): void {
        if (sortType === SortType.NONE) {
            return;
        }
        
        const cards = this.cardDisplays.map(cardDisplay => cardDisplay.getCard()).filter(card => card !== undefined);
        
        if (sortType === SortType.BY_SUIT) {
            sortBySuitInternal(cards);
        } else if (sortType === SortType.BY_RANK) {
            sortByRankInternal(cards);
        }
        
        // Sort the card displays based on the sorted cards
        this.cardDisplays.sort((a, b) => {
            const cardA = a.getCard();
            const cardB = b.getCard();
            if (!cardA || !cardB) return 0;
            
            return cards.indexOf(cardA) - cards.indexOf(cardB);
        });
        
        // Arrange the card displays
        this.arrangeCards();
    }
}   