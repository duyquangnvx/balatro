import { SortType } from "../components/areas/hand-area";
import { GAME_CONFIG } from "../config/game-config";
import { PlayingCard, Rank, Suit } from "../objects/playing-card";
import { sortByRankInternal, sortBySuitInternal } from "../utils/card-helpers";

export class BoardManager {
    // Map of all cards, indexed by id
    private readonly cardMap: Map<string, PlayingCard>;

    // List of all cards in the hand
    private handCards: PlayingCard[];

    // List of all cards in the deck
    private deckCards: PlayingCard[];

    // List of all cards in the discarded pile
    private discardedCards: PlayingCard[];

    // List of all cards in the played pile
    private playedCards: PlayingCard[];

    private maxSelectedCards: number;

    constructor() {
        this.cardMap = new Map();
        
        this.handCards = [];
        this.deckCards = [];
        this.discardedCards = [];
        this.playedCards = [];
        this.maxSelectedCards = GAME_CONFIG.MAX_SELECTED_CARDS;

        this.initiateCards();
    }

    private initiateCards(): void {
        // Clear the card map
        this.cardMap.clear();

        // Add all cards to the card map
        Object.values(Suit).forEach(suit => {
            Object.values(Rank).forEach(rank => {
                const card = new PlayingCard(suit, rank);
                this.cardMap.set(card.getId(), card);
            });
        });
    }

    public getCard(id: string): PlayingCard | undefined {
        return this.cardMap.get(id);
    }

    public getHandCards(): PlayingCard[] {
        return this.handCards;
    }

    public getDeckCards(): PlayingCard[] {
        return this.deckCards;
    }

    public getDiscardedCards(): PlayingCard[] {
        return this.discardedCards;
    }

    public getPlayedCards(): PlayingCard[] {
        return this.playedCards;
    }

    public getMaxSelectedCards(): number {
        return this.maxSelectedCards;
    }

    public applySorting(sortType: SortType): void {
        switch (sortType) {
            case SortType.BY_SUIT:
                sortBySuitInternal(this.handCards);
                break;
            case SortType.BY_RANK:
                sortByRankInternal(this.handCards);
                break;
            default:
                // No sorting
                break;
        }
    }

    public newGame(): void {
        // Reset for new game
        this.handCards = [];
        this.discardedCards = [];
        this.playedCards = [];
        this.deckCards = Array.from(this.cardMap.values());

        this.deckCards.forEach(card => {
            card.setFlipped(false);
        });
        this.shuffleDeck();

        const initCards = this.drawInitCards();
        this.addCardsToHand(initCards);
    }

    public playCards(cards: PlayingCard[]): void {
        // Validate cards are in hand
        cards.forEach(card => {
            if (!this.handCards.includes(card)) {
                throw new Error("Card is not in hand");
            }
        });

        // Add the cards to the played pile
        this.playedCards.push(...cards);

        // Remove the cards from the hand
        this.handCards = this.handCards.filter(card => !cards.includes(card));

        // todo: calculate score
    }

    public discardCards(cards: PlayingCard[]): PlayingCard[] {
        // Validate cards are in hand
        cards.forEach(card => {
            if (!this.handCards.includes(card)) {
                throw new Error("Card is not in hand");
            }
        });

        // Add the cards to the discarded pile
        this.discardedCards.push(...cards);

        // Remove the cards from the hand
        this.handCards = this.handCards.filter(card => !cards.includes(card));
    
        const drawnCards = this.drawCards(cards.length);
        this.addCardsToHand(drawnCards);

        return drawnCards;
    }

    private shuffleDeck(): void {
        Phaser.Utils.Array.Shuffle(this.deckCards);
    }

    private drawInitCards(): PlayingCard[] {
        return this.drawCards(GAME_CONFIG.INITIAL_HAND_SIZE);
    }

    private drawCards(count: number): PlayingCard[] {
        const drawnCards: PlayingCard[] = [];
        for (let i = 0; i < count; i++) {
            const card = this.drawCard();
            if (card) {
                drawnCards.push(card);
            }
        }

        return drawnCards;
    }

    /**
     * Draw a from deck to hand
     */
    private drawCard(): PlayingCard | undefined {
        // Validate deck is not empty
        if (this.deckCards.length === 0) {
            throw new Error("Deck is empty");
        }

        // Draw a card from the deck
        return this.deckCards.pop();
    }

    private addCardsToHand(cards: PlayingCard[]): void {
        cards.forEach(card => {
            card.setFlipped(true);
            this.handCards.push(card);
        });
    }
}