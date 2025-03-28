import { Card } from "./card";
export enum Suit {
    HEARTS = 'hearts',
    DIAMONDS = 'diamonds',
    CLUBS = 'clubs',
    SPADES = 'spades'
}

export enum Rank {
    ACE = 'A',
    TWO = '2',
    THREE = '3',
    FOUR = '4',
    FIVE = '5',
    SIX = '6',
    SEVEN = '7',
    EIGHT = '8',
    NINE = '9',
    TEN = '10',
    JACK = 'J',
    QUEEN = 'Q',
    KING = 'K'
}

export enum Enhancement {
    NORMAL = 'normal',
    GOLD = 'gold',
    GLASS = 'glass',
    STEEL = 'steel',
    STONE = 'stone',
    WILD = 'wild',
    MULT = 'mult',
    BONUS = 'bonus',
    LUCKY = 'lucky'
}

export class PlayingCard extends Card {
    private readonly suit: Suit;
    private readonly rank: Rank;
    private enhancement: Enhancement;

    constructor(suit: Suit, rank: Rank) {
        super();
        this.suit = suit;
        this.rank = rank;
        this.enhancement = Enhancement.NORMAL;
    }

    public getSuit(): Suit {
        return this.suit;
    }

    public getRank(): Rank {
        return this.rank;
    }

    public getEnhancement(): Enhancement {
        return this.enhancement;
    }
}