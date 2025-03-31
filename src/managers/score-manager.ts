import { PlayingCard, Rank, Suit } from "../objects/playing-card";
import { LocalStorage } from "../utils/local-storage";
import { Logger } from "../utils/logger";
import { GAME_CONFIG } from "../config/game-config";
import { RunManager } from "./run-manager";
import { 
    PokerHandType,
    isRoyalFlush,
    isStraightFlush,
    isFourOfAKind,
    isFullHouse,
    isFlush,
    isStraight,
    isThreeOfAKind,
    isTwoPair,
    isPair,
    getHighestCard,
    getCardPointValue,
    isFiveOfAKind,
    isFlushHouse,
    isFlushFive
} from "../utils/poker-utils";

/**
 * Score result
 */
export interface ScoreResult {
    combination: PokerHandType;
    score: number;
    multiplier: number;
    totalScore: number;
    description: string;
    level: number;
}

/**
 * Score manager for the game
 */
export class ScoreManager {
    private static instance: ScoreManager;

    private roundScore: number = 0;
    private scoreMultiplier: number = 1;
    private highScores: number[] = [];
    
    private readonly runManager: RunManager;

    private readonly STORAGE_KEYS = {
        HIGH_SCORES: 'high_scores'
    };

    private constructor() {
        this.runManager = RunManager.getInstance();
    }

    /**
     * Get instance of ScoreManager (singleton)
     */
    public static getInstance(): ScoreManager {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager();
        }
        return ScoreManager.instance;
    }

    public init(): void {
        this.loadData();
        this.roundScore = 0;
        this.scoreMultiplier = 1;
        this.runManager.startNewRun();
        this.saveData();
    }

    /**
     * Calculate score for a hand
     * @param cards The cards to calculate score for
     * @returns Score result
     */
    public calculateScore(cards: PlayingCard[]): ScoreResult {
        // Clone array to avoid affecting the original cards
        const handCards = [...cards];
        
        // The poker hands are checked in order from highest to lowest (priority for stronger hands)
        if (handCards.length < 1) {
            return this.createScoreResult(PokerHandType.HIGH_CARD, 0, "No cards played");
        }
        
        // Check secret hands (secret hands)
        // Flush Five (highest in secret hands)
        if (isFlushFive(handCards)) {
            return this.createScoreResult(
                PokerHandType.FLUSH_FIVE, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.FLUSH_FIVE], 
                "Flush Five: 5 lá cùng giá trị và cùng chất"
            );
        }
        
        // Five of a Kind
        if (isFiveOfAKind(handCards)) {
            return this.createScoreResult(
                PokerHandType.FIVE_OF_A_KIND, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.FIVE_OF_A_KIND], 
                "Five of a Kind: 5 lá cùng giá trị"
            );
        }
        
        // Flush House
        if (isFlushHouse(handCards)) {
            return this.createScoreResult(
                PokerHandType.FLUSH_HOUSE, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.FLUSH_HOUSE], 
                "Flush House: Full House với tất cả lá cùng chất"
            );
        }

        // Check regular hands (regular hands)
        // Royal Flush
        if (isRoyalFlush(handCards)) {
            return this.createScoreResult(
                PokerHandType.ROYAL_FLUSH, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.ROYAL_FLUSH], 
                "Royal Flush: 10, J, Q, K, A cùng chất"
            );
        }

        // Straight Flush
        if (isStraightFlush(handCards)) {
            return this.createScoreResult(
                PokerHandType.STRAIGHT_FLUSH, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.STRAIGHT_FLUSH], 
                "Straight Flush: 5 lá liên tiếp cùng chất"
            );
        }

        // Four of a Kind
        if (isFourOfAKind(handCards)) {
            return this.createScoreResult(
                PokerHandType.FOUR_OF_A_KIND, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.FOUR_OF_A_KIND], 
                "Four of a Kind: 4 lá cùng giá trị"
            );
        }

        // Full House
        if (isFullHouse(handCards)) {
            return this.createScoreResult(
                PokerHandType.FULL_HOUSE, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.FULL_HOUSE], 
                "Full House: 3 lá cùng giá trị + 2 lá cùng giá trị khác"
            );
        }

        // Flush
        if (isFlush(handCards)) {
            return this.createScoreResult(
                PokerHandType.FLUSH, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.FLUSH], 
                "Flush: 5 lá cùng chất"
            );
        }

        // Straight
        if (isStraight(handCards)) {
            return this.createScoreResult(
                PokerHandType.STRAIGHT, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.STRAIGHT], 
                "Straight: 5 lá liên tiếp"
            );
        }

        // Three of a Kind
        if (isThreeOfAKind(handCards)) {
            return this.createScoreResult(
                PokerHandType.THREE_OF_A_KIND, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.THREE_OF_A_KIND], 
                "Three of a Kind: 3 lá cùng giá trị"
            );
        }

        // Two Pair
        if (isTwoPair(handCards)) {
            return this.createScoreResult(
                PokerHandType.TWO_PAIR, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.TWO_PAIR], 
                "Two Pair: 2 cặp khác nhau"
            );
        }

        // Pair
        if (isPair(handCards)) {
            return this.createScoreResult(
                PokerHandType.PAIR, 
                GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.PAIR], 
                "Pair: 2 lá cùng giá trị"
            );
        }

        // If no combination, return High Card
        const highestCard = getHighestCard(handCards);
        return this.createScoreResult(
            PokerHandType.HIGH_CARD, 
            GAME_CONFIG.POKER_HAND_SCORES[PokerHandType.HIGH_CARD], 
            `High Card: Lá cao nhất là ${highestCard.getRank()}`
        );
    }

    /**
     * Update the score for the current round
     * @param score The score to add
     */
    public updateRoundScore(score: number): void {
        this.roundScore += score;
    }

    /**
     * Update the score multiplier
     * @param multiplier The new multiplier
     */
    public updateMultiplier(multiplier: number): void {
        this.scoreMultiplier = multiplier;
    }

    /**
     * Finish the round and return the total score
     * @returns The total score of this round
     */
    public finishRound(): number {
        const totalScore = this.roundScore * this.scoreMultiplier;
        this.roundScore = 0;
        this.saveData();
        return totalScore;
    }

    /**
     * Save the score to the high scores list
     * @param score The score to save
     */
    public saveHighScore(score: number): void {
        // Only save score if it's greater than 0
        if (score > 0) {
            this.highScores.push(score);
            this.highScores.sort((a, b) => b - a);
            
            // Limit to only save the top 5 scores
            if (this.highScores.length > 5) {
                this.highScores = this.highScores.slice(0, 5);
            }
            
            // Save the high scores
            this.saveData();
        }
    }

    /**
     * Start a new game
     */
    public startNewGame(): void {
        this.roundScore = 0;
        this.scoreMultiplier = 1;
        
        // Start a new run in RunManager
        this.runManager.startNewRun();
        
        this.saveData();
    }

    /**
     * Get the current round score
     */
    public getRoundScore(): number {
        return this.roundScore;
    }

    /**
     * Get the current score multiplier
     */
    public getScoreMultiplier(): number {
        return this.scoreMultiplier;
    }

    /**
     * Get the high scores list
     */
    public getHighScores(): number[] {
        return [...this.highScores];
    }

    /**
     * Create a score result
     */
    private createScoreResult(combination: PokerHandType, baseScore: number, description: string): ScoreResult {
        const handLevel = this.runManager.getHandLevel(combination);
        const handMultiplier = GAME_CONFIG.POKER_HAND_MULTIPLIERS[combination] || 1;
        
        // Score increase based on the level of the hand
        const levelAdjustedScore = baseScore * handLevel;
        
        // Total score = adjusted score * hand multiplier * current multiplier
        const totalScore = levelAdjustedScore * handMultiplier * this.scoreMultiplier;
        
        return {
            combination,
            score: levelAdjustedScore,
            multiplier: handMultiplier * this.scoreMultiplier,
            totalScore,
            description,
            level: handLevel
        };
    }

    /**
     * Save game data
     */
    private saveData(): void {
        const storage = LocalStorage.getInstance();
        storage.set(this.STORAGE_KEYS.HIGH_SCORES, this.highScores);
    }

    /**
     * Load game data
     */
    private loadData(): void {
        const storage = LocalStorage.getInstance();
        this.highScores = storage.get(this.STORAGE_KEYS.HIGH_SCORES, []) as number[];
    }
} 