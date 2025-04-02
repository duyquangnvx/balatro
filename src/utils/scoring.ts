import { ChipsAndMultiplier, GAME_CONFIG } from "../config/game-config";
import { RunState } from "../managers/run-manager";
import { PlayingCard } from "../objects/playing-card";
import { Rank } from "../objects/playing-card";
import { PokerHandEvaluationResult, PokerHandType } from "./poker-utils";

export type ScoreResult = {
    pokerScore: ChipsAndMultiplier;
    cardScores: Record<string, ChipsAndMultiplier>;
    totalScore: number;
    totalChips: number;
    totalMultiplier: number;
}


export function calculateScore(pokerHandEvaluation: PokerHandEvaluationResult, runState: RunState): ScoreResult {
    const { handType, cards } = pokerHandEvaluation;
    
    const handConfig = GAME_CONFIG.POKER_HAND_LEVELS[handType];
    if (!handConfig) {
        throw new Error(`Hand type ${handType} not found in GAME_CONFIG.POKER_HAND_LEVELS`);
    }

    const pokerScore = calculatePokerHandScore(handType, runState);

    let totalCardChips = 0;
    let totalCardMultiplier = 0;
    const cardScores: Record<string, ChipsAndMultiplier> = {};
    for (const card of cards) {
        const cardScore = calculateCardScore(card);
        cardScores[card.getId()] = cardScore;
        totalCardChips += cardScore.chips;
        totalCardMultiplier += cardScore.multiplier;
    }

    const totalChips = pokerScore.chips + totalCardChips;   
    const totalMultiplier = pokerScore.multiplier + totalCardMultiplier;
    const totalScore = totalChips * totalMultiplier;

    return {
        pokerScore,
        cardScores: cardScores as Record<string, ChipsAndMultiplier>,
        totalScore,
        totalChips,
        totalMultiplier
    };
}

export function calculatePokerHandScore(handType: PokerHandType, runState: RunState): ChipsAndMultiplier {
    const handConfig = GAME_CONFIG.POKER_HAND_LEVELS[handType];
    if (!handConfig) {
        throw new Error(`Hand type ${handType} not found in GAME_CONFIG.POKER_HAND_LEVELS`);
    }

    let handLevel = runState.pokerHandLevels[handType] || 1;
    const maxLevel = handConfig.maxLevel || 10;
    handLevel = Math.min(handLevel, maxLevel);

    const chips = handConfig.baseChips + (handLevel - 1) * handConfig.chipsPerLevel;
    const multiplier = handConfig.baseMultiplier + (handLevel - 1) * handConfig.multiplierPerLevel;

    return {
        chips,
        multiplier
    };
}


export function calculateCardScore(card: PlayingCard): ChipsAndMultiplier {
    return {
        chips: getCardPointValue(card),
        multiplier: 0
    }
}

/**
 * Get the point value of the card (used for scoring)
 */
function getCardPointValue(card: PlayingCard): number {
    switch (card.getRank()) {
        case Rank.ACE: return 11;
        case Rank.KING: return 10;
        case Rank.QUEEN: return 10;
        case Rank.JACK: return 10;
        default: return parseInt(card.getRank()) || 0;
    }
}