import { Scene } from "phaser";
import { CardArea, AreaProps, CardTransform } from "./card-area";
import { PlayingCardDisplay } from "../playing-card-display";
import { sortBySuitInternal, sortByRankInternal } from "../../utils/card-utils";
import { Toast } from "../../ui/toast";
import { BoardManager } from "../../managers/board-manager";
import { PlayingCard } from "../../objects/playing-card";
import { LocalStorage } from "../../utils/local-storage";
import { PlayArea } from "./play-area";
import { DiscardArea } from "./discard-area";

export enum SortType {
    NONE,
    BY_SUIT,
    BY_RANK
}

export class HandArea extends CardArea<PlayingCardDisplay> {
    private readonly selectedCards: PlayingCardDisplay[];

    constructor(scene: Scene, config: AreaProps, boardManager: BoardManager) {
        super(scene, config, boardManager);
        this.selectedCards = [];
    }

    /**
     * Override addCardDisplay to apply sort type
     */
    override addCardDisplay(cardDisplay: PlayingCardDisplay): boolean {
        const added = super.addCardDisplay(cardDisplay);
        if (added) {
            this.applyCurrentSortType();
        }
        return added;
    }

    /**
     * Override removeCard to remove selected card
     */ 
    public override removeCardDisplay(card: PlayingCardDisplay): PlayingCardDisplay | undefined {
        const removedCard = super.removeCardDisplay(card);
        if (removedCard) {
            this.unselectCard(removedCard);
        }
        return removedCard;
    }

    protected override calculateCardRelativeTransformAt(index: number): CardTransform {
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
    
    protected override onCardClick(cardDisplay: PlayingCardDisplay): void {
        if (this.isCardSelected(cardDisplay)) {
            this.unselectCard(cardDisplay);
        } else {
            this.selectCard(cardDisplay);
        }
     }
    
    public selectCard(cardDisplay: PlayingCardDisplay): void {
        // Lower down card if it is already selected
        const index = this.selectedCards.indexOf(cardDisplay);
        if (index !== -1) {
            return;
        }

        // Check if the number of selected cards has reached the maximum
        const maxSelectedCards = this.boardManager.getMaxSelectedCards();
        if (this.selectedCards.length >= maxSelectedCards) {
            // Show warning toast
            Toast.getInstance().warning(
                `Cannot select more than ${maxSelectedCards} cards!`, 
                { position: 'top', duration: 1500 }
            );
            return;
        }

        if (!this.cardDisplays.includes(cardDisplay)) {
            return;
        }
        
        // Add card to selected cards
        this.selectedCards.push(cardDisplay);
        cardDisplay.liftUp();
        
        this.emit('card-selected-changed', this.selectedCards);
    }

    public unselectCard(cardDisplay: PlayingCardDisplay): void {
        const index = this.selectedCards.indexOf(cardDisplay);
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
            cardDisplay.lowerDown();
            this.emit('card-selected-changed', this.selectedCards);
        }
    }

    public isCardSelected(cardDisplay: PlayingCardDisplay): boolean {
        return this.selectedCards.includes(cardDisplay);
    }

    public getSelectedCards(): PlayingCard[] {
        return this.selectedCards.map(cardDisplay => cardDisplay.getCard()).filter(card => card !== undefined) as PlayingCard[];
    }

    public clearSelection(): void {
        if (this.selectedCards.length === 0) {
            return;
        }

        this.selectedCards.forEach(cardDisplay => cardDisplay.lowerDown());
        this.selectedCards.length = 0;
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

        this.saveSortType(sortType);
        
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

    private applyCurrentSortType(): void {
        const sortType = this.loadSortType();
        this.applySorting(sortType);
    }

    private saveSortType(sortType: SortType): void {
        LocalStorage.getInstance().set('hand_sort_type', sortType);
    }

    private loadSortType(): SortType {
        return LocalStorage.getInstance().get('hand_sort_type', SortType.NONE) as SortType;
    }
}   