import { Scene } from "phaser";
import { GAME_CONFIG } from "../config/game-config";

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

    private money: number = GAME_CONFIG.STARTING_MONEY;
    private ante: number = 1;
    private round: number = 1;

    private constructor() {

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
}
