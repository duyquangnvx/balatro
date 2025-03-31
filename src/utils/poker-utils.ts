import { PlayingCard, Rank, Suit } from "../objects/playing-card";

/**
 * Poker hand types
 */
export enum PokerHandType {
    HIGH_CARD = "HIGH_CARD",
    PAIR = "PAIR",
    TWO_PAIR = "TWO_PAIR",
    THREE_OF_A_KIND = "THREE_OF_A_KIND",
    STRAIGHT = "STRAIGHT",
    FLUSH = "FLUSH",
    FULL_HOUSE = "FULL_HOUSE",
    FOUR_OF_A_KIND = "FOUR_OF_A_KIND",
    STRAIGHT_FLUSH = "STRAIGHT_FLUSH",
    ROYAL_FLUSH = "ROYAL_FLUSH",

    // Secret poker hands in Balatro
    FIVE_OF_A_KIND = "FIVE_OF_A_KIND",
    FLUSH_HOUSE = "FLUSH_HOUSE",
    FLUSH_FIVE = "FLUSH_FIVE"
}

/**
 * Result of poker hand evaluation
 */
export interface PokerHandEvaluationResult {
    handType: PokerHandType;
    description: string;
}

/**
 * Check if the hand is a Royal Flush
 * (10, J, Q, K, A same suit)
 */
export function isRoyalFlush(cards: PlayingCard[]): boolean {
    if (cards.length !== 5) return false;
    
    // Must be a Straight Flush and the highest card must be A
    if (!isStraightFlush(cards)) return false;
    
    const ranks = cards.map(card => card.getRank());
    return ranks.includes(Rank.ACE) && ranks.includes(Rank.KING) && 
           ranks.includes(Rank.QUEEN) && ranks.includes(Rank.JACK) &&
           ranks.includes(Rank.TEN);
}

/**
 * Check if the hand is a Straight Flush
 * (5 consecutive cards of the same suit)
 */
export function isStraightFlush(cards: PlayingCard[]): boolean {
    return isFlush(cards) && isStraight(cards);
}

/**
 * Check if the hand is a Four of a Kind
 * (4 cards of the same value)
 */
export function isFourOfAKind(cards: PlayingCard[]): boolean {
    if (cards.length < 4) return false;
    
    const rankCounts = countCardRanks(cards);
    return Object.values(rankCounts).some(count => count >= 4);
}

/**
 * Check if the hand is a Full House
 * (3 cards of the same value + 2 cards of the same value)
 */
export function isFullHouse(cards: PlayingCard[]): boolean {
    if (cards.length < 5) return false;
    
    const rankCounts = countCardRanks(cards);
    const countValues = Object.values(rankCounts);
    
    return countValues.includes(3) && countValues.includes(2);
}

/**
 * Check if the hand is a Flush
 * (5 cards of the same suit)
 */
export function isFlush(cards: PlayingCard[]): boolean {
    if (cards.length < 5) return false;
    
    const firstSuit = cards[0].getSuit();
    return cards.every(card => card.getSuit() === firstSuit);
}

/**
 * Check if the hand is a Straight
 * (5 consecutive cards)
 */
export function isStraight(cards: PlayingCard[]): boolean {
    if (cards.length < 5) return false;
    
    // Get the value of the cards
    const values = cards.map(card => getCardValue(card));
    values.sort((a, b) => a - b);
    
    // Special case for Straight with A (A can be at the beginning or end)
    // A-2-3-4-5
    if (values[values.length-1] === 14 && // Ace
        values[0] === 2 && 
        values[1] === 3 && 
        values[2] === 4 && 
        values[3] === 5) {
        return true;
    }
    
    // Check if the cards are consecutive
    for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i-1] + 1) {
            return false;
        }
    }
    
    return true;
}

/**
 * Check if the hand is a Three of a Kind
 * (3 cards of the same value)
 */
export function isThreeOfAKind(cards: PlayingCard[]): boolean {
    if (cards.length < 3) return false;
    
    const rankCounts = countCardRanks(cards);
    return Object.values(rankCounts).some(count => count >= 3);
}

/**
 * Check if the hand is a Two Pair
 * (2 different pairs)
 */
export function isTwoPair(cards: PlayingCard[]): boolean {
    if (cards.length < 4) return false;
    
    const rankCounts = countCardRanks(cards);
    const pairs = Object.values(rankCounts).filter(count => count >= 2);
    
    return pairs.length >= 2;
}

/**
 * Check if the hand is a Pair
 * (2 cards of the same value)
 */
export function isPair(cards: PlayingCard[]): boolean {
    if (cards.length < 2) return false;
    
    const rankCounts = countCardRanks(cards);
    return Object.values(rankCounts).some(count => count >= 2);
}

/**
 * Check if the hand is a Five of a Kind
 * (5 cards of the same value - secret hand in Balatro)
 */
export function isFiveOfAKind(cards: PlayingCard[]): boolean {
    if (cards.length < 5) return false;
    
    const rankCounts = countCardRanks(cards);
    return Object.values(rankCounts).some(count => count >= 5);
}

/**
 * Check if the hand is a Flush House
 * (Full House with all cards of the same suit - secret hand in Balatro)
 */
export function isFlushHouse(cards: PlayingCard[]): boolean {
    return isFullHouse(cards) && isFlush(cards);
}

/**
 * Check if the hand is a Flush Five
 * (5 cards of the same value and the same suit - secret hand in Balatro)
 */
export function isFlushFive(cards: PlayingCard[]): boolean {
    return isFiveOfAKind(cards) && isFlush(cards);
}

/**
 * Count the number of cards for each value
 */
export function countCardRanks(cards: PlayingCard[]): Record<Rank, number> {
    const rankCounts: Record<Rank, number> = {} as Record<Rank, number>;
    
    cards.forEach(card => {
        const rank = card.getRank();
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    return rankCounts;
}

/**
 * Get the value of the card (used for comparison)
 */
export function getCardValue(card: PlayingCard): number {
    switch (card.getRank()) {
        case Rank.ACE: return 14;
        case Rank.KING: return 13;
        case Rank.QUEEN: return 12;
        case Rank.JACK: return 11;
        case Rank.TEN: return 10;
        case Rank.NINE: return 9;
        case Rank.EIGHT: return 8;
        case Rank.SEVEN: return 7;
        case Rank.SIX: return 6;
        case Rank.FIVE: return 5;
        case Rank.FOUR: return 4;
        case Rank.THREE: return 3;
        case Rank.TWO: return 2;
        default: return 0;
    }
}

/**
 * Get the point value of the card (used for scoring)
 */
export function getCardPointValue(card: PlayingCard): number {
    switch (card.getRank()) {
        case Rank.ACE: return 14;
        case Rank.KING: return 13;
        case Rank.QUEEN: return 12;
        case Rank.JACK: return 11;
        case Rank.TEN: return 10;
        default: return parseInt(card.getRank()) || 0;
    }
}

/**
 * Get the highest card in the hand
 */
export function getHighestCard(cards: PlayingCard[]): PlayingCard {
    if (cards.length === 0) {
        throw new Error("Cards array is empty");
    }
    
    return cards.reduce((highest, current) => {
        return getCardValue(current) > getCardValue(highest) ? current : highest;
    }, cards[0]);
}

/**
 * Evaluate a poker hand and return the highest possible combination
 * @param cards The cards to evaluate
 * @returns The evaluation result containing hand type and description
 */
export function evaluatePokerHand(cards: PlayingCard[]): PokerHandEvaluationResult {
    if (cards.length < 1) {
        return {
            handType: PokerHandType.HIGH_CARD,
            description: "No cards played"
        };
    }
    
    // Check secret hands (highest priority)
    // Flush Five
    if (isFlushFive(cards)) {
        return {
            handType: PokerHandType.FLUSH_FIVE,
            description: "Flush Five: 5 lá cùng giá trị và cùng chất"
        };
    }
    
    // Five of a Kind
    if (isFiveOfAKind(cards)) {
        return {
            handType: PokerHandType.FIVE_OF_A_KIND,
            description: "Five of a Kind: 5 lá cùng giá trị"
        };
    }
    
    // Flush House
    if (isFlushHouse(cards)) {
        return {
            handType: PokerHandType.FLUSH_HOUSE,
            description: "Flush House: Full House với tất cả lá cùng chất"
        };
    }

    // Check regular hands
    // Royal Flush
    if (isRoyalFlush(cards)) {
        return {
            handType: PokerHandType.ROYAL_FLUSH,
            description: "Royal Flush: 10, J, Q, K, A cùng chất"
        };
    }

    // Straight Flush
    if (isStraightFlush(cards)) {
        return {
            handType: PokerHandType.STRAIGHT_FLUSH,
            description: "Straight Flush: 5 lá liên tiếp cùng chất"
        };
    }

    // Four of a Kind
    if (isFourOfAKind(cards)) {
        return {
            handType: PokerHandType.FOUR_OF_A_KIND,
            description: "Four of a Kind: 4 lá cùng giá trị"
        };
    }

    // Full House
    if (isFullHouse(cards)) {
        return {
            handType: PokerHandType.FULL_HOUSE,
            description: "Full House: 3 lá cùng giá trị + 2 lá cùng giá trị khác"
        };
    }

    // Flush
    if (isFlush(cards)) {
        return {
            handType: PokerHandType.FLUSH,
            description: "Flush: 5 lá cùng chất"
        };
    }

    // Straight
    if (isStraight(cards)) {
        return {
            handType: PokerHandType.STRAIGHT,
            description: "Straight: 5 lá liên tiếp"
        };
    }

    // Three of a Kind
    if (isThreeOfAKind(cards)) {
        return {
            handType: PokerHandType.THREE_OF_A_KIND,
            description: "Three of a Kind: 3 lá cùng giá trị"
        };
    }

    // Two Pair
    if (isTwoPair(cards)) {
        return {
            handType: PokerHandType.TWO_PAIR,
            description: "Two Pair: 2 cặp khác nhau"
        };
    }

    // Pair
    if (isPair(cards)) {
        return {
            handType: PokerHandType.PAIR,
            description: "Pair: 2 lá cùng giá trị"
        };
    }

    // If no combination, return High Card
    const highestCard = getHighestCard(cards);
    return {
        handType: PokerHandType.HIGH_CARD,
        description: `High Card: Lá cao nhất là ${highestCard.getRank()}`
    };
} 