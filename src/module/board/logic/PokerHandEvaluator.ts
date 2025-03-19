import { ICard, Suit, Rank } from '../models/types';

/**
 * Enum for poker hand types, ordered from lowest to highest value
 */
export enum PokerHandType {
    HIGH_CARD = 'High Card',
    PAIR = 'Pair',
    TWO_PAIR = 'Two Pair',
    THREE_OF_A_KIND = 'Three of a Kind',
    STRAIGHT = 'Straight',
    FLUSH = 'Flush',
    FULL_HOUSE = 'Full House',
    FOUR_OF_A_KIND = 'Four of a Kind',
    STRAIGHT_FLUSH = 'Straight Flush',
    ROYAL_FLUSH = 'Royal Flush',
    FIVE_OF_A_KIND = 'Five of a Kind',
    FLUSH_HOUSE = 'Flush House'
}

/**
 * Interface for hand score result
 */
export interface HandScore {
    chips: number;
    mult: number;
    handType: PokerHandType;
}

/**
 * Helper interface for hand rank frequency analysis
 */
interface RankCount {
    [key: string]: number;
}

/**
 * PokerHandEvaluator class - Evaluates poker hands and determines their base score values
 * Based on Balatro scoring system: https://balatrogame.fandom.com/wiki/Poker_Hands
 */
export class PokerHandEvaluator {
    
    /**
     * Evaluate a hand of cards and return its base score
     * @param cards Array of cards to evaluate
     * @returns HandScore object containing chips, mult, and hand type
     */
    public static evaluateHand(cards: ICard[]): HandScore {
        if (!cards || cards.length === 0) {
            return { chips: 0, mult: 0, handType: PokerHandType.HIGH_CARD };
        }
        
        // Cards need to be face up to be evaluated
        const visibleCards = cards.filter(card => card.faceUp);
        
        if (visibleCards.length === 0) {
            return { chips: 0, mult: 0, handType: PokerHandType.HIGH_CARD };
        }
        
        // Check for the highest possible hand type
        const handType = this.identifyHandType(visibleCards);
        
        // Return the base score for the hand type
        return this.getBaseScore(handType);
    }
    
    /**
     * Get cards that form the highest poker hand
     * @param cards Array of cards to evaluate
     * @returns Array of cards that form the highest poker hand
     */
    public static getPokerHandCards(cards: ICard[]): ICard[] {
        if (!cards || cards.length === 0) return [];
        
        const visibleCards = cards.filter(card => card.faceUp);
        if (visibleCards.length === 0) return [];

        // Sort cards by value for easier processing
        const sortedCards = [...visibleCards].sort((a, b) => 
            this.getCardValue(b.rank) - this.getCardValue(a.rank)
        );

        // Check each hand type from highest to lowest and return the cards that form it
        if (this.isFlushHouse(sortedCards)) {
            return sortedCards.slice(0, 5); // All 5 cards form the flush house
        }

        if (this.isFiveOfAKind(sortedCards)) {
            // Get all cards of the same rank
            const rank = sortedCards[0].rank;
            return sortedCards.filter(card => card.rank === rank).slice(0, 5);
        }

        if (this.isRoyalFlush(sortedCards) || this.isStraightFlush(sortedCards)) {
            return sortedCards.slice(0, 5); // All 5 cards form the straight flush/royal flush
        }

        if (this.isFourOfAKind(sortedCards)) {
            const rankCount = this.countRanks(sortedCards);
            const fourOfAKindRank = Object.entries(rankCount).find(([_, count]) => count === 4)?.[0];
            return sortedCards.filter(card => card.rank === fourOfAKindRank).slice(0, 4);
        }

        if (this.isFullHouse(sortedCards)) {
            const rankCount = this.countRanks(sortedCards);
            const threeOfAKindRank = Object.entries(rankCount).find(([_, count]) => count === 3)?.[0];
            const pairRank = Object.entries(rankCount).find(([_, count]) => count === 2)?.[0];
            return sortedCards.filter(card => 
                card.rank === threeOfAKindRank || card.rank === pairRank
            ).slice(0, 5);
        }

        if (this.isFlush(sortedCards)) {
            // Get the highest 5 cards of the same suit
            const suit = sortedCards[0].suit;
            return sortedCards.filter(card => card.suit === suit).slice(0, 5);
        }

        if (this.isStraight(sortedCards)) {
            // Handle Ace-low straight
            if (this.isAceLowStraight(sortedCards)) {
                const ace = sortedCards.find(card => card.rank === Rank.ACE);
                const lowCards = sortedCards.filter(card => this.getCardValue(card.rank) <= 5);
                return [...lowCards, ace!].slice(0, 5);
            }
            // Regular straight
            return this.getStraightCards(sortedCards).slice(0, 5);
        }

        if (this.isThreeOfAKind(sortedCards)) {
            const rankCount = this.countRanks(sortedCards);
            const threeOfAKindRank = Object.entries(rankCount).find(([_, count]) => count === 3)?.[0];
            return sortedCards.filter(card => card.rank === threeOfAKindRank).slice(0, 3);
        }

        if (this.isTwoPair(sortedCards)) {
            const rankCount = this.countRanks(sortedCards);
            // Get the two highest pairs
            const pairRanks = Object.entries(rankCount)
                .filter(([_, count]) => count === 2)
                .sort(([rankA], [rankB]) => this.getCardValue(rankB as Rank) - this.getCardValue(rankA as Rank))
                .slice(0, 2)
                .map(([rank]) => rank);
            return sortedCards.filter(card => pairRanks.includes(card.rank)).slice(0, 4);
        }

        if (this.isPair(sortedCards)) {
            const rankCount = this.countRanks(sortedCards);
            // Get the highest pair
            const pairRank = Object.entries(rankCount)
                .filter(([_, count]) => count === 2)
                .sort(([rankA], [rankB]) => this.getCardValue(rankB as Rank) - this.getCardValue(rankA as Rank))[0][0];
            return sortedCards.filter(card => card.rank === pairRank).slice(0, 2);
        }

        // High card - return the highest card
        return [sortedCards[0]];
    }

    /**
     * Check if cards form an Ace-low straight (A-2-3-4-5)
     */
    private static isAceLowStraight(cards: ICard[]): boolean {
        const values = cards.map(card => this.getCardValue(card.rank)).sort((a, b) => a - b);
        return JSON.stringify(values.slice(0, 4)) === JSON.stringify([2, 3, 4, 5]) && values.includes(14);
    }

    /**
     * Get cards that form a straight
     */
    private static getStraightCards(cards: ICard[]): ICard[] {
        const values = cards.map(card => this.getCardValue(card.rank));
        const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
        
        for (let i = 0; i < uniqueValues.length - 4; i++) {
            const possibleStraight = uniqueValues.slice(i, i + 5);
            if (this.isSequential(possibleStraight)) {
                const straightValues = new Set(possibleStraight);
                return cards.filter(card => straightValues.has(this.getCardValue(card.rank))).slice(0, 5);
            }
        }
        return [];
    }

    /**
     * Check if array of numbers forms a sequence
     */
    private static isSequential(numbers: number[]): boolean {
        for (let i = 1; i < numbers.length; i++) {
            if (numbers[i] !== numbers[i - 1] - 1) return false;
        }
        return true;
    }
    
    /**
     * Identify the type of poker hand
     * @param cards Array of cards to evaluate
     * @returns The hand type
     */
    private static identifyHandType(cards: ICard[]): PokerHandType {
        // Clone the cards array to avoid modifying the original
        const sortedCards = [...cards].sort((a, b) => 
            this.getCardValue(b.rank) - this.getCardValue(a.rank)
        );
        
        // Check for special hands in order from highest to lowest value
        if (this.isFlushHouse(sortedCards)) {
            return PokerHandType.FLUSH_HOUSE;
        }
        
        if (this.isFiveOfAKind(sortedCards)) {
            return PokerHandType.FIVE_OF_A_KIND;
        }
        
        if (this.isRoyalFlush(sortedCards)) {
            return PokerHandType.ROYAL_FLUSH;
        }
        
        if (this.isStraightFlush(sortedCards)) {
            return PokerHandType.STRAIGHT_FLUSH;
        }
        
        if (this.isFourOfAKind(sortedCards)) {
            return PokerHandType.FOUR_OF_A_KIND;
        }
        
        if (this.isFullHouse(sortedCards)) {
            return PokerHandType.FULL_HOUSE;
        }
        
        if (this.isFlush(sortedCards)) {
            return PokerHandType.FLUSH;
        }
        
        if (this.isStraight(sortedCards)) {
            return PokerHandType.STRAIGHT;
        }
        
        if (this.isThreeOfAKind(sortedCards)) {
            return PokerHandType.THREE_OF_A_KIND;
        }
        
        if (this.isTwoPair(sortedCards)) {
            return PokerHandType.TWO_PAIR;
        }
        
        if (this.isPair(sortedCards)) {
            return PokerHandType.PAIR;
        }
        
        // Default to high card
        return PokerHandType.HIGH_CARD;
    }
    
    /**
     * Get the base score for a hand type
     * @param handType The type of poker hand
     * @returns The base score (chips and mult)
     */
    private static getBaseScore(handType: PokerHandType): HandScore {
        switch (handType) {
            case PokerHandType.HIGH_CARD:
                return { chips: 5, mult: 1, handType };
            case PokerHandType.PAIR:
                return { chips: 10, mult: 2, handType };
            case PokerHandType.TWO_PAIR:
                return { chips: 20, mult: 2, handType };
            case PokerHandType.THREE_OF_A_KIND:
                return { chips: 30, mult: 3, handType };
            case PokerHandType.STRAIGHT:
                return { chips: 30, mult: 4, handType };
            case PokerHandType.FLUSH:
                return { chips: 35, mult: 4, handType };
            case PokerHandType.FULL_HOUSE:
                return { chips: 40, mult: 4, handType };
            case PokerHandType.FOUR_OF_A_KIND:
                return { chips: 60, mult: 7, handType };
            case PokerHandType.STRAIGHT_FLUSH:
            case PokerHandType.ROYAL_FLUSH: // Royal Flush has same base score as Straight Flush
                return { chips: 100, mult: 8, handType };
            case PokerHandType.FIVE_OF_A_KIND:
                return { chips: 120, mult: 12, handType };
            case PokerHandType.FLUSH_HOUSE:
                return { chips: 140, mult: 14, handType };
            default:
                return { chips: 0, mult: 0, handType: PokerHandType.HIGH_CARD };
        }
    }
    
    /**
     * Get the numeric value of a card rank
     * @param rank The card rank
     * @returns The numerical value
     */
    private static getCardValue(rank: Rank): number {
        switch (rank) {
            case Rank.ACE:
                return 14; // Ace high
            case Rank.KING:
                return 13;
            case Rank.QUEEN:
                return 12;
            case Rank.JACK:
                return 11;
            case Rank.TEN:
                return 10;
            case Rank.NINE:
                return 9;
            case Rank.EIGHT:
                return 8;
            case Rank.SEVEN:
                return 7;
            case Rank.SIX:
                return 6;
            case Rank.FIVE:
                return 5;
            case Rank.FOUR:
                return 4;
            case Rank.THREE:
                return 3;
            case Rank.TWO:
                return 2;
            default:
                return 0;
        }
    }
    
    /**
     * Count occurrences of each rank in a hand
     * @param cards Array of cards
     * @returns Object with ranks as keys and counts as values
     */
    private static countRanks(cards: ICard[]): RankCount {
        const rankCount: RankCount = {};
        
        for (const card of cards) {
            if (rankCount[card.rank]) {
                rankCount[card.rank]++;
            } else {
                rankCount[card.rank] = 1;
            }
        }
        
        return rankCount;
    }
    
    /**
     * Check if all cards have the same suit
     * @param cards Array of cards
     * @returns True if all cards have the same suit
     */
    private static isSameSuit(cards: ICard[]): boolean {
        if (cards.length <= 1) return true;
        
        const firstSuit = cards[0].suit;
        return cards.every(card => card.suit === firstSuit);
    }
    
    /**
     * Check if cards form a flush house (full house with all cards of the same suit)
     * @param cards Array of cards
     * @returns True if it's a flush house
     */
    private static isFlushHouse(cards: ICard[]): boolean {
        // Need 5 cards for a flush house
        if (cards.length !== 5) return false;
        
        // Must be a full house
        if (!this.isFullHouse(cards)) return false;
        
        // All cards must be the same suit
        return this.isSameSuit(cards);
    }
    
    /**
     * Check if cards form a five of a kind
     * @param cards Array of cards
     * @returns True if it's a five of a kind
     */
    private static isFiveOfAKind(cards: ICard[]): boolean {
        // Need 5 cards for a five of a kind
        if (cards.length !== 5) return false;
        
        const rankCount = this.countRanks(cards);
        const ranks = Object.keys(rankCount);
        
        // Must have exactly one rank with 5 cards
        return ranks.length === 1 && rankCount[ranks[0]] === 5 && !this.isSameSuit(cards);
    }
    
    /**
     * Check if cards form a royal flush (A, K, Q, J, 10 of the same suit)
     * @param cards Array of cards
     * @returns True if it's a royal flush
     */
    private static isRoyalFlush(cards: ICard[]): boolean {
        // Need 5 cards for a royal flush
        if (cards.length !== 5) return false;
        
        // All cards must be the same suit
        if (!this.isSameSuit(cards)) return false;
        
        // Check for A, K, Q, J, 10
        const ranks = cards.map(card => card.rank).sort();
        const royalRanks = [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE].sort();
        
        return JSON.stringify(ranks) === JSON.stringify(royalRanks);
    }
    
    /**
     * Check if cards form a straight flush (sequential cards of the same suit)
     * @param cards Array of cards
     * @returns True if it's a straight flush
     */
    private static isStraightFlush(cards: ICard[]): boolean {
        // Need 5 cards for a straight flush
        if (cards.length !== 5) return false;
        
        // All cards must be the same suit
        if (!this.isSameSuit(cards)) return false;
        
        // Must be a straight
        return this.isStraight(cards);
    }
    
    /**
     * Check if cards form a four of a kind
     * @param cards Array of cards
     * @returns True if it's a four of a kind
     */
    private static isFourOfAKind(cards: ICard[]): boolean {
        // Need at least 4 cards for a four of a kind
        if (cards.length < 4) return false;
        
        const rankCount = this.countRanks(cards);
        
        // Check if any rank appears exactly 4 times
        return Object.values(rankCount).some(count => count === 4);
    }
    
    /**
     * Check if cards form a full house (three of a kind + pair)
     * @param cards Array of cards
     * @returns True if it's a full house
     */
    private static isFullHouse(cards: ICard[]): boolean {
        // Need 5 cards for a full house
        if (cards.length !== 5) return false;
        
        const rankCount = this.countRanks(cards);
        const counts = Object.values(rankCount);
        
        // Need exactly two different ranks with counts of 3 and 2
        return counts.length === 2 && counts.includes(3) && counts.includes(2);
    }
    
    /**
     * Check if cards form a flush (all the same suit)
     * @param cards Array of cards
     * @returns True if it's a flush
     */
    private static isFlush(cards: ICard[]): boolean {
        // Need 5 cards for a flush
        if (cards.length !== 5) return false;
        
        // All cards must be the same suit
        return this.isSameSuit(cards);
    }
    
    /**
     * Check if cards form a straight (sequential cards)
     * @param cards Array of cards
     * @returns True if it's a straight
     */
    private static isStraight(cards: ICard[]): boolean {
        // Need 5 cards for a straight
        if (cards.length !== 5) return false;
        
        // Sort by card value (numerically)
        const sortedValues = cards.map(card => this.getCardValue(card.rank)).sort((a, b) => a - b);
        
        // Check for A-5 straight (special case where Ace is low)
        if (JSON.stringify(sortedValues) === JSON.stringify([2, 3, 4, 5, 14])) {
            return true;
        }
        
        // Check if cards form a sequence
        for (let i = 1; i < sortedValues.length; i++) {
            if (sortedValues[i] !== sortedValues[i - 1] + 1) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if cards form a three of a kind
     * @param cards Array of cards
     * @returns True if it's a three of a kind
     */
    private static isThreeOfAKind(cards: ICard[]): boolean {
        // Need at least 3 cards for a three of a kind
        if (cards.length < 3) return false;
        
        const rankCount = this.countRanks(cards);
        
        // Check if any rank appears exactly 3 times
        return Object.values(rankCount).some(count => count === 3);
    }
    
    /**
     * Check if cards form a two pair
     * @param cards Array of cards
     * @returns True if it's a two pair
     */
    private static isTwoPair(cards: ICard[]): boolean {
        // Need at least 4 cards for a two pair
        if (cards.length < 4) return false;
        
        const rankCount = this.countRanks(cards);
        const pairs = Object.values(rankCount).filter(count => count === 2);
        
        // Need exactly two pairs
        return pairs.length === 2;
    }
    
    /**
     * Check if cards form a pair
     * @param cards Array of cards
     * @returns True if it's a pair
     */
    private static isPair(cards: ICard[]): boolean {
        // Need at least 2 cards for a pair
        if (cards.length < 2) return false;
        
        const rankCount = this.countRanks(cards);
        
        // Check if any rank appears exactly 2 times
        return Object.values(rankCount).some(count => count === 2);
    }
} 