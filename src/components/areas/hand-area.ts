import { Scene } from "phaser";
import { CardArea, AreaProps, CardTransform } from "./card-area";
import { PlayingCardDisplay } from "../playing-card-display";
import { sortBySuitInternal, sortByRankInternal } from "../../utils/card-helpers";
import { GAME_CONFIG } from "../../config/game-config";
import { Toast, ToastType } from "../../ui/toast";

export enum SortType {
    NONE,
    BY_SUIT,
    BY_RANK
}

export class HandArea extends CardArea<PlayingCardDisplay> {
    private readonly selectedCards: PlayingCardDisplay[];

    private maxSelectedCards: number;

    constructor(scene: Scene, config: AreaProps, maxSelectedCards: number = GAME_CONFIG.MAX_SELECTED_CARDS) {
        super(scene, config);
        this.selectedCards = [];
        this.maxSelectedCards = maxSelectedCards;
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
        const maxWidth = this.props.width;
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
            this.props.x - totalWidth / 2,
            this.props.x + totalWidth / 2,
            (index + 0.5) / cardCount);

        return {
            x: ratio,
            y: this.props.y,
            rotation: this.props.rotation ?? 0,
            depth: (this.props.depth ?? 0) + index
        };
    }
    
    protected override onCardClick(card: PlayingCardDisplay): void {
        this.selectCard(card);
     }
    
    public selectCard(card: PlayingCardDisplay): void {
        // Lower down card if it is already selected
        const index = this.selectedCards.indexOf(card);
        if (index !== -1) {
            // If card is already selected, then unselect it
            this.selectedCards.splice(index, 1);
            card.lowerDown();
            this.emit('card-selected-changed', this.selectedCards);
            return;
        }

        // Check if the number of selected cards has reached the maximum
        if (this.selectedCards.length >= this.maxSelectedCards) {
            // Show warning toast
            Toast.getInstance().warning(
                `Cannot select more than ${this.maxSelectedCards} cards!`, 
                { position: 'top', duration: 1500 }
            );
            return;
        }

        if (!this.cardDisplays.includes(card)) {
            return;
        }
        
        // Add card to selected cards
        this.selectedCards.push(card);
        card.liftUp();
        
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
        
        // Emit event when all selected cards are cleared
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
    }

    public setMaxSelectedCards(maxSelectedCards: number): void {
        this.maxSelectedCards = maxSelectedCards;
    }

    public getMaxSelectedCards(): number {
        return this.maxSelectedCards;
    }
}   