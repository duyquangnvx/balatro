import { Card } from '../module/gameplay/models/Card';

export enum GamePhase {
    INITIALIZING = 'INITIALIZING',
    DEALING = 'DEALING',
    PLAYER_TURN = 'PLAYER_TURN',
    EVALUATING = 'EVALUATING',
    GAME_OVER = 'GAME_OVER'
}

export interface PlayerState {
    score: number;
    handValue: number;
    selectedCards: Card[];
    lastAction?: string;
}

export interface GameState {
    phase: GamePhase;
    round: number;
    player: PlayerState;
    deckCardsRemaining: number;
    isGameOver: boolean;
    highScore: number;
}

export const initialGameState: GameState = {
    phase: GamePhase.INITIALIZING,
    round: 1,
    player: {
        score: 0,
        handValue: 0,
        selectedCards: [],
    },
    deckCardsRemaining: 52,
    isGameOver: false,
    highScore: 0
}; 