import { ChipsAndMultiplier, GAME_CONFIG } from "../config/game-config";
import { RunState } from "../managers/run-manager";
import { PokerHandType } from "./poker-utils";

export function calculateScore(handType: PokerHandType, runState: RunState) {
    const handConfig = GAME_CONFIG.POKER_HAND_LEVELS[handType];
    if (!handConfig) {
        throw new Error(`Hand type ${handType} not found in GAME_CONFIG.POKER_HAND_LEVELS`);
    }

    const { chips, multiplier } = calculatePokerHandScore(handType, runState);
    const totalScore = chips * multiplier;
    return {
        chips,
        multiplier,
        totalScore
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