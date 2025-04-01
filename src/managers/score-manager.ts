import { PlayingCard, Rank, Suit } from "../objects/playing-card";
import { LocalStorage } from "../utils/local-storage";
import { Logger } from "../utils/logger";
import { GAME_CONFIG } from "../config/game-config";
import { RunManager } from "./run-manager";
import { 
    PokerHandType,
    getCardPointValue,
    evaluatePokerHand
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
        
        // Evaluate poker hand to get the highest combination
        const evaluationResult = evaluatePokerHand(handCards);
        
        // Get score for the combination
        return this.createScoreResult(
            evaluationResult.handType,
            GAME_CONFIG.POKER_HAND_SCORES[evaluationResult.handType] || 0,
            evaluationResult.description
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
     * Start a new round
     */
    public startNewRound(): void {
        this.roundScore = 0;
        this.scoreMultiplier = 1;
        
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

    /**
     * Get current money
     */
    public getMoney(): number {
        return this.runManager.getMoney();
    }
    
    /**
     * Update score and money based on score result
     * @param score Score to add
     */
    public updateScoreAndMoney(score: number): void {
        this.updateRoundScore(score);
        
        // Also update money in run manager
        this.runManager.updateMoney(score);
    }
} 