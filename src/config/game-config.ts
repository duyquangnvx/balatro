import { PokerHandType } from "../utils/poker-utils";

/**
 * Types of Blinds in Balatro
 */
export enum BlindType {
    SMALL_BLIND = "SMALL_BLIND",
    BIG_BLIND = "BIG_BLIND",
    BOSS_BLIND = "BOSS_BLIND",
    FINISHER_BLIND = "FINISHER_BLIND"
}

/**
 * Configuration for a Blind
 */
export interface BlindConfig {
    name: string;
    type: BlindType;
    baseMultiplier: number; // Multiplier with base chips of Ante
    description: string;
    effect?: string; // Description of special effect of Blind (if any)
    canSkip: boolean; // Can skip or not
    initialHandSize: number; // Initial number of cards in hand
    maxPlays: number; // Maximum number of plays allowed
    maxDiscards: number; // Maximum number of discards allowed
}

/**
 * Configuration for an Ante
 */
export interface AnteConfig {
    level: number;
    baseChips: number; // Base chips for Ante
    name: string;
}

export const GAME_CONFIG = {
    SCREEN_WIDTH: 1280,
    SCREEN_HEIGHT: 720,

    DEBUG: false,

    INITIAL_DECK_SIZE: 52,
    INITIAL_HAND_SIZE: 8,
    MAX_SELECTED_CARDS: 5,
    MAX_JOKERS: 12,
    STARTING_MONEY: 0,
    
    // Basic points for each poker hand based on Balatro
    POKER_HAND_SCORES: {
        [PokerHandType.HIGH_CARD]: 5,    // 5 chips x 1 mult
        [PokerHandType.PAIR]: 10,        // 10 chips x 1 mult
        [PokerHandType.TWO_PAIR]: 15,    // 15 chips x 1 mult
        [PokerHandType.THREE_OF_A_KIND]: 20, // 20 chips x 2 mult
        [PokerHandType.STRAIGHT]: 30,    // 30 chips x 2 mult
        [PokerHandType.FLUSH]: 35,       // 35 chips x 3 mult
        [PokerHandType.FULL_HOUSE]: 40,  // 40 chips x 3 mult
        [PokerHandType.FOUR_OF_A_KIND]: 45, // 45 chips x 4 mult
        [PokerHandType.STRAIGHT_FLUSH]: 50, // 50 chips x 6 mult
        [PokerHandType.ROYAL_FLUSH]: 70, // 70 chips x 8 mult

        // Points for secret hands (defined by yourself, can be adjusted)
        [PokerHandType.FIVE_OF_A_KIND]: 90, // 90 chips x 10 mult
        [PokerHandType.FLUSH_HOUSE]: 80,    // 80 chips x 9 mult
        [PokerHandType.FLUSH_FIVE]: 100     // 100 chips x 15 mult
    } as Record<PokerHandType, number>,
    
    // Multiplier for each poker hand based on Balatro
    POKER_HAND_MULTIPLIERS: {
        [PokerHandType.HIGH_CARD]: 1,
        [PokerHandType.PAIR]: 1,
        [PokerHandType.TWO_PAIR]: 1,
        [PokerHandType.THREE_OF_A_KIND]: 2,
        [PokerHandType.STRAIGHT]: 2,
        [PokerHandType.FLUSH]: 3,
        [PokerHandType.FULL_HOUSE]: 3,
        [PokerHandType.FOUR_OF_A_KIND]: 4,
        [PokerHandType.STRAIGHT_FLUSH]: 6,
        [PokerHandType.ROYAL_FLUSH]: 8,

        // Multiplier for secret hands
        [PokerHandType.FIVE_OF_A_KIND]: 10,
        [PokerHandType.FLUSH_HOUSE]: 9,
        [PokerHandType.FLUSH_FIVE]: 15
    } as Record<PokerHandType, number>,
    
    // Configuration for Blinds
    BLINDS: {
        SMALL_BLIND: {
            name: "Small Blind",
            type: BlindType.SMALL_BLIND,
            baseMultiplier: 1.0, // 1x base chips
            description: "Blind cơ bản đầu tiên của mỗi Ante",
            canSkip: true,
            initialHandSize: 8,
            maxPlays: 4,
            maxDiscards: 4
        } as BlindConfig,
        
        BIG_BLIND: {
            name: "Big Blind",
            type: BlindType.BIG_BLIND,
            baseMultiplier: 1.5, // 1.5x base chips
            description: "Blind cơ bản thứ hai của mỗi Ante",
            canSkip: true,
            initialHandSize: 8,
            maxPlays: 4,
            maxDiscards: 4
        } as BlindConfig,
        
        // Basic Boss Blinds
        BOSS_BLINDS: [
            {
                name: "The Wheel",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0, // 2x base chips
                description: "Blind cuối cùng của Ante",
                effect: "Bài J, Q, K và A bị vô hiệu hóa",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4
            },
            {
                name: "The Fare",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Các lá bài chất Spades (♠) bị vô hiệu hóa",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4
            },
            {
                name: "The Arm",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Chỉ được chơi tối đa 4 lá bài mỗi lượt",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4
            }
        ] as BlindConfig[],
        
        // Finisher Blinds that appear at the final Ante
        FINISHER_BLINDS: [
            {
                name: "Amber Acorn",
                type: BlindType.FINISHER_BLIND,
                baseMultiplier: 2.5, // 2.5x base chips
                description: "Blind cuối cùng của run",
                effect: "Chỉ có thể chơi Four of a Kind hoặc Full House",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4
            },
            {
                name: "Verdant Leaf",
                type: BlindType.FINISHER_BLIND,
                baseMultiplier: 2.5,
                description: "Blind cuối cùng của run",
                effect: "Lá bài đánh ra có 50% xuất hiện úp mặt",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4
            }
        ] as BlindConfig[]
    },
    
    // Configuration for Antes (based on pre-release demo from wiki)
    ANTES: [
        {
            level: 1,
            baseChips: 300,
            name: "Ante 1"
        },
        {
            level: 2,
            baseChips: 800,
            name: "Ante 2"
        },
        {
            level: 3,
            baseChips: 2800,
            name: "Ante 3"
        },
        {
            level: 4,
            baseChips: 7000,
            name: "Ante 4"
        },
        {
            level: 5,
            baseChips: 14000,
            name: "Ante 5"
        },
        {
            level: 6,
            baseChips: 25000,
            name: "Ante 6"
        },
        {
            level: 7,
            baseChips: 45000,
            name: "Ante 7"
        },
        {
            level: 8,
            baseChips: 80000,
            name: "Ante 8 (Final)"
        }
    ] as AnteConfig[]
}
