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
    cards: PlayingCard[];      // Các lá bài tạo nên poker hand
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
 * @returns The evaluation result containing hand type, description and relevant cards
 */
export function evaluatePokerHand(cards: PlayingCard[]): PokerHandEvaluationResult {
    if (cards.length < 1) {
        return {
            handType: PokerHandType.HIGH_CARD,
            description: "No cards played",
            cards: []
        };
    }
    
    // Clone array to avoid affecting the original cards
    const handCards = [...cards];
    
    // Check secret hands (highest priority)
    // Flush Five
    if (isFlushFive(handCards)) {
        const selectedCards = handCards.slice(0, 5);
        return {
            handType: PokerHandType.FLUSH_FIVE,
            description: "Flush Five: 5 lá cùng giá trị và cùng chất",
            cards: selectedCards
        };
    }
    
    // Five of a Kind
    if (isFiveOfAKind(handCards)) {
        const rankCounts = countCardRanks(handCards);
        const fiveOfAKindRank = Object.entries(rankCounts)
            .find(([_, count]) => count >= 5)?.[0] as Rank;
            
        if (fiveOfAKindRank) {
            const selectedCards = handCards
                .filter(card => card.getRank() === fiveOfAKindRank)
                .slice(0, 5);
                
            return {
                handType: PokerHandType.FIVE_OF_A_KIND,
                description: "Five of a Kind: 5 lá cùng giá trị",
                cards: selectedCards
            };
        }
    }
    
    // Flush House
    if (isFlushHouse(handCards)) {
        const rankCounts = countCardRanks(handCards);
        const threeOfAKindRank = Object.entries(rankCounts)
            .find(([_, count]) => count >= 3)?.[0] as Rank;
        const pairRank = Object.entries(rankCounts)
            .find(([rank, count]) => count >= 2 && rank !== threeOfAKindRank)?.[0] as Rank;
            
        if (threeOfAKindRank && pairRank) {
            const threeCards = handCards
                .filter(card => card.getRank() === threeOfAKindRank)
                .slice(0, 3);
            const pairCards = handCards
                .filter(card => card.getRank() === pairRank)
                .slice(0, 2);
                
            return {
                handType: PokerHandType.FLUSH_HOUSE,
                description: "Flush House: Full House với tất cả lá cùng chất",
                cards: [...threeCards, ...pairCards]
            };
        }
    }

    // Check regular hands
    // Royal Flush
    if (isRoyalFlush(handCards)) {
        const selectedCards = handCards.slice(0, 5);
        return {
            handType: PokerHandType.ROYAL_FLUSH,
            description: "Royal Flush: 10, J, Q, K, A cùng chất",
            cards: selectedCards
        };
    }

    // Straight Flush
    if (isStraightFlush(handCards)) {
        const selectedCards = handCards.slice(0, 5);
        const highCard = getHighestCard(selectedCards);
        return {
            handType: PokerHandType.STRAIGHT_FLUSH,
            description: "Straight Flush: 5 lá liên tiếp cùng chất",
            cards: selectedCards
        };
    }

    // Four of a Kind
    if (isFourOfAKind(handCards)) {
        const rankCounts = countCardRanks(handCards);
        const fourOfAKindRank = Object.entries(rankCounts)
            .find(([_, count]) => count >= 4)?.[0] as Rank;
            
        if (fourOfAKindRank) {
            const selectedCards = handCards
                .filter(card => card.getRank() === fourOfAKindRank)
                .slice(0, 4);
                
            return {
                handType: PokerHandType.FOUR_OF_A_KIND,
                description: "Four of a Kind: 4 lá cùng giá trị",
                cards: selectedCards
            };
        }
    }

    // Full House
    if (isFullHouse(handCards)) {
        const rankCounts = countCardRanks(handCards);
        const threeOfAKindRank = Object.entries(rankCounts)
            .find(([_, count]) => count >= 3)?.[0] as Rank;
        const pairRank = Object.entries(rankCounts)
            .find(([rank, count]) => count >= 2 && rank !== threeOfAKindRank)?.[0] as Rank;
            
        if (threeOfAKindRank && pairRank) {
            const threeCards = handCards
                .filter(card => card.getRank() === threeOfAKindRank)
                .slice(0, 3);
            const pairCards = handCards
                .filter(card => card.getRank() === pairRank)
                .slice(0, 2);
                
            return {
                handType: PokerHandType.FULL_HOUSE,
                description: "Full House: 3 lá cùng giá trị + 2 lá cùng giá trị khác",
                cards: [...threeCards, ...pairCards]
            };
        }
    }

    // Flush
    if (isFlush(handCards)) {
        const selectedCards = handCards.slice(0, 5);
        const highCard = getHighestCard(selectedCards);
        return {
            handType: PokerHandType.FLUSH,
            description: "Flush: 5 lá cùng chất",
            cards: selectedCards
        };
    }

    // Straight
    if (isStraight(handCards)) {
        const selectedCards = handCards.slice(0, 5);
        const highCard = getHighestCard(selectedCards);
        return {
            handType: PokerHandType.STRAIGHT,
            description: "Straight: 5 lá liên tiếp",
            cards: selectedCards
        };
    }

    // Three of a Kind
    if (isThreeOfAKind(handCards)) {
        const rankCounts = countCardRanks(handCards);
        const threeOfAKindRank = Object.entries(rankCounts)
            .find(([_, count]) => count >= 3)?.[0] as Rank;
            
        if (threeOfAKindRank) {
            const selectedCards = handCards
                .filter(card => card.getRank() === threeOfAKindRank)
                .slice(0, 3);
                
            return {
                handType: PokerHandType.THREE_OF_A_KIND,
                description: "Three of a Kind: 3 lá cùng giá trị",
                cards: selectedCards
            };
        }
    }

    // Two Pair
    if (isTwoPair(handCards)) {
        const rankCounts = countCardRanks(handCards);
        const pairRanks = Object.entries(rankCounts)
            .filter(([_, count]) => count >= 2)
            .sort(([rank1, _], [rank2, __]) => {
                // Sắp xếp theo giá trị giảm dần
                const value1 = getCardValue({getRank: () => rank1 as Rank} as PlayingCard);
                const value2 = getCardValue({getRank: () => rank2 as Rank} as PlayingCard);
                return value2 - value1;
            })
            .map(([rank, _]) => rank as Rank)
            .slice(0, 2);
            
        if (pairRanks.length >= 2) {
            const firstPairCards = handCards
                .filter(card => card.getRank() === pairRanks[0])
                .slice(0, 2);
            const secondPairCards = handCards
                .filter(card => card.getRank() === pairRanks[1])
                .slice(0, 2);
                
            return {
                handType: PokerHandType.TWO_PAIR,
                description: "Two Pair: 2 cặp khác nhau",
                cards: [...firstPairCards, ...secondPairCards]
            };
        }
    }

    // Pair
    if (isPair(handCards)) {
        const rankCounts = countCardRanks(handCards);
        const pairRanks = Object.entries(rankCounts)
            .filter(([_, count]) => count >= 2)
            .sort(([rank1, _], [rank2, __]) => {
                // Sắp xếp theo giá trị giảm dần
                const value1 = getCardValue({getRank: () => rank1 as Rank} as PlayingCard);
                const value2 = getCardValue({getRank: () => rank2 as Rank} as PlayingCard);
                return value2 - value1;
            })
            .map(([rank, _]) => rank as Rank);
            
        if (pairRanks.length > 0) {
            const selectedCards = handCards
                .filter(card => card.getRank() === pairRanks[0])
                .slice(0, 2);
                
            return {
                handType: PokerHandType.PAIR,
                description: "Pair: 2 lá cùng giá trị",
                cards: selectedCards
            };
        }
    }

    // If no combination, return High Card
    const highestCard = getHighestCard(handCards);
    return {
        handType: PokerHandType.HIGH_CARD,
        description: `High Card: Lá cao nhất là ${highestCard.getRank()}`,
        cards: [highestCard]
    };
} 

export function getPokerHandName(handType: PokerHandType): string {
    switch (handType) {
        case PokerHandType.HIGH_CARD: return "High Card";
        case PokerHandType.PAIR: return "Pair";
        case PokerHandType.TWO_PAIR: return "Two Pair";
        case PokerHandType.THREE_OF_A_KIND: return "Three of a Kind";
        case PokerHandType.STRAIGHT: return "Straight";
        case PokerHandType.FLUSH: return "Flush";
        case PokerHandType.FULL_HOUSE: return "Full House";
        case PokerHandType.FOUR_OF_A_KIND: return "Four of a Kind";
        case PokerHandType.STRAIGHT_FLUSH: return "Straight Flush";
        case PokerHandType.ROYAL_FLUSH: return "Royal Flush";
        case PokerHandType.FIVE_OF_A_KIND: return "Five of a Kind";
        case PokerHandType.FLUSH_HOUSE: return "Flush House";
        case PokerHandType.FLUSH_FIVE: return "Flush Five";
        default: return "Unknown";
    }
}
