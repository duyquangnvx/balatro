import { Scene } from "phaser";
import { GAME_CONFIG } from "../config/game-config";
import { RunManager } from "./run-manager";
import { BoardManager } from "./board-manager";
import { ScoreManager } from "./score-manager";
import { PlayingCard } from "../objects/playing-card";

/**
 * Game state enum
 */
export enum GameState {
    MAIN_MENU = 'MAIN_MENU',
    PLAYING = 'PLAYING',
    SHOPPING = 'SHOPPING',
    BLIND_SELECTION = 'BLIND_SELECTION',
    GAME_OVER = 'GAME_OVER',
    PAUSED = 'PAUSED'
}

export class GameManager {
    private static instance: GameManager;

    private gameState: GameState;

    private boardManager: BoardManager;
    private runManager: RunManager;
    private scoreManager: ScoreManager;

    private constructor() {
        this.boardManager = new BoardManager();
        this.runManager = RunManager.getInstance();
        this.scoreManager = ScoreManager.getInstance();
    }

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    public init(): void {
        this.gameState = GameState.MAIN_MENU;
    }

    public getBoardManager(): BoardManager {
        return this.boardManager;
    }

    public getRunManager(): RunManager {
        return this.runManager;
    }

    public getScoreManager(): ScoreManager {
        return this.scoreManager;
    }

    public startNewGame(): void {
        this.runManager.startNewRun();
    }

    public startNewRound(): void {
        this.scoreManager.startNewRound();
        this.boardManager.startNewRound();
        
        const handSize = this.runManager.getHandSize();
        this.boardManager.dealCardsToHand(handSize);
    }

    public finishRound(): void {
        this.runManager.advanceToNextBlind();
    }

    public playCards(cards: PlayingCard[]): PlayingCard[] {
        if (this.runManager.getRemainingPlays() <= 0) {
            throw new Error("No more plays to play");
        }

        this.boardManager.playCards(cards);

        const scoreResult = this.scoreManager.calculateScore(cards);
        this.runManager.addScore(scoreResult.score);
        this.runManager.usePlay();

        const newCards = this.boardManager.dealCardsToHand(cards.length);
        return newCards;
    }

    public discardCards(cards: PlayingCard[]): PlayingCard[] {
        if (this.runManager.getRemainingDiscards() <= 0) {
            throw new Error("No more discards to play");
        }

        this.boardManager.discardCards(cards);
        this.runManager.useDiscard();

        const newCards = this.boardManager.dealCardsToHand(cards.length);
        return newCards;
    }
    
    
}
