import { Scene } from "phaser";
import { GAME_CONFIG } from "../config/game-config";
import { RunManager } from "./run-manager";
import { BoardManager } from "./board-manager";
import { PlayingCard } from "../objects/playing-card";
import { calculateScore, ScoreResult } from "../utils/scoring";
import { evaluatePokerHand, PokerHandType } from "../utils/poker-utils";

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

export type PlayResult = {
    handType: PokerHandType;
    playedCards: PlayingCard[];
    pokerCards: PlayingCard[];
    newCards: PlayingCard[];
    scoreResult: ScoreResult;
}

export class GameManager {
    private static instance: GameManager;

    private gameState: GameState;

    private boardManager: BoardManager;
    private runManager: RunManager;

    private constructor() {
        this.boardManager = new BoardManager();
        this.runManager = RunManager.getInstance();
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

    public startNewGame(): void {
        this.runManager.startNewRun();
    }

    public startNewRound(): void {
        this.boardManager.startNewRound();
        
        const handSize = this.runManager.getHandSize();
        this.boardManager.dealCardsToHand(handSize);
    }

    public finishRound(): void {
        this.runManager.advanceToNextBlind();
    }

    public playCards(cards: PlayingCard[]): PlayResult {
        if (this.runManager.getRemainingPlays() <= 0) {
            throw new Error("No more plays to play");
        }

        this.boardManager.playCards(cards);

        const pokerHandEvaluation = evaluatePokerHand(cards);
        const scoreResult = calculateScore(pokerHandEvaluation, this.runManager.getRunState());
        this.runManager.addScore(scoreResult.totalScore);
        this.runManager.usePlay();

        const newCards = this.boardManager.dealCardsToHand(cards.length);
 
        return {
            newCards,
            playedCards: cards,
            pokerCards: pokerHandEvaluation.cards,
            scoreResult,
            handType: pokerHandEvaluation.handType
        }
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
