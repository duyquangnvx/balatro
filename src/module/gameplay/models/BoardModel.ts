import { CardModel } from "./CardModel";
import { DeckModel } from "./DeckModel";
import { DiscardPileModel } from "./DiscardPileModel";
import { HandModel } from "./HandModel";
import { Suit } from "./types";
import { Rank } from "./types";

// Logic for the board
export class BoardModel {
    private readonly cardMap: Map<string, CardModel>;
    private readonly deck: DeckModel;
    private readonly discardPile: DiscardPileModel;
    private readonly hand: HandModel;

    private readonly INITIAL_HAND_SIZE: number = 8;

    constructor() {
        this.cardMap = new Map<string, CardModel>();
        this.deck = new DeckModel();
        this.discardPile = new DiscardPileModel();
        this.hand = new HandModel();

        this.initCards();
    }

    private initCards(): void {
        this.cardMap.clear();

        // Create all 52 cards
        Object.values(Suit).forEach(suit => {
            Object.values(Rank).forEach(rank => {
                const card = new CardModel(suit, rank);
                card.setDeckReference(this.deck);
                this.cardMap.set(card.id, card);
            })
        }); 
    }

    public newGame(): void {
        this.discardPile.clear();
        this.hand.clear();

        this.deck.setCards(Array.from(this.cardMap.values()));
        this.deck.shuffle();
    }

    public drawInitCards(): CardModel[] {
        const initCards = this.deck.drawCards(this.INITIAL_HAND_SIZE);
        this.hand.addCards(initCards);
        return initCards;
    }

    public playSelectedCards(): void {
        const selectedCards = this.discardSelectedCards();

        // todo: calculate score of played cards
    }

    public discardSelectedCards(): CardModel[] {
        const selectedCards = this.hand.getSelectedCards();
        this.discardCards(selectedCards);
        this.hand.clearSelection();

        return selectedCards;
    }

    public discardCards(cards: CardModel[]): void {
        if (cards.length > 0) {
            this.discardPile.addCards(cards);
            this.hand.removeCards(cards);
        }
    }

    public drawCards(count: number): CardModel[] {
        const newCards = this.deck.drawCards(count);
        this.hand.addCards(newCards);
        return newCards;
    }

    public getAllCards(): CardModel[] {
        return Array.from(this.cardMap.values());
    }

    public getCardById(id: string): CardModel | undefined {
        return this.cardMap.get(id);
    }

    public getDeck(): DeckModel {
        return this.deck;
    }

    public getDiscardPile(): DiscardPileModel {
        return this.discardPile;
    }

    public getHand(): HandModel {
        return this.hand;
    }

    public getHandSize(): number {
        return this.INITIAL_HAND_SIZE;
    }
}