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

export interface ICard {
    suit: Suit;
    rank: Rank;
    value: number;
    isVisible: boolean;
} 

/**
 * DeckStyle - Enum for all available card back styles
 */
export enum DeckStyle {
    ABANDONED = 'abandoned',
    ANAGLYPH = 'anaglyph',
    BLACK = 'black',
    BLUE = 'blue',
    CHECKERED = 'checkered',
    ERRATIC = 'erratic',
    GHOST = 'ghost',
    GREEN = 'green',
    MAGIC = 'magci', // Note: This is spelled "magci" in the JSON
    NEBULA = 'nebula',
    PAINTED = 'painted',
    PLASMA = 'plasma',
    RED = 'red',
    YELLOW = 'yellow',
    ZODIAC = 'zodiac'
} 