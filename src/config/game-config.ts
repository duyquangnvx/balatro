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
    reward: number; // Reward for the Blind
    minAnteLevel: number; // Minimum Ante level required for this Blind to appear
}

/**
 * Configuration for an Ante
 */
export interface AnteConfig {
    level: number;
    baseChips: number; // Base chips for Ante
    name: string;
}

export type ChipsAndMultiplier = {
    chips: number;
    multiplier: number;
}

export interface PokerHandLevelConfig {
    baseChips: number; // Chips cơ bản ở cấp 1
    chipsPerLevel: number; // Số Chips tăng thêm mỗi cấp
    baseMultiplier: number; // Hệ số nhân cơ bản ở cấp 1
    multiplierPerLevel: number; // Số Multiplier tăng thêm mỗi cấp
    maxLevel?: number; // Cấp độ tối đa (tùy chọn, mặc định có thể là 10)
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
    POKER_HAND_LEVELS: {
        [PokerHandType.HIGH_CARD]: {
            baseChips: 5,
            chipsPerLevel: 5,
            baseMultiplier: 1,
            multiplierPerLevel: 0.5,
            maxLevel: 10
        },
        [PokerHandType.PAIR]: {
            baseChips: 10,
            chipsPerLevel: 5,
            baseMultiplier: 1,
            multiplierPerLevel: 0.5,
            maxLevel: 10
        },
        [PokerHandType.TWO_PAIR]: {
            baseChips: 15,
            chipsPerLevel: 5,
            baseMultiplier: 2,
            multiplierPerLevel: 0.5,
            maxLevel: 10
        },
        [PokerHandType.THREE_OF_A_KIND]: {
            baseChips: 20,
            chipsPerLevel: 10,
            baseMultiplier: 3,
            multiplierPerLevel: 1,
            maxLevel: 10
        },
        [PokerHandType.STRAIGHT]: {
            baseChips: 30,
            chipsPerLevel: 10,
            baseMultiplier: 4,
            multiplierPerLevel: 1,
            maxLevel: 10
        },
        [PokerHandType.FLUSH]: {
            baseChips: 35,
            chipsPerLevel: 15,
            baseMultiplier: 4,
            multiplierPerLevel: 1,
            maxLevel: 10
        },
        [PokerHandType.FULL_HOUSE]: {
            baseChips: 40,
            chipsPerLevel: 15,
            baseMultiplier: 4,
            multiplierPerLevel: 1,
            maxLevel: 10
        },
        [PokerHandType.FOUR_OF_A_KIND]: {
            baseChips: 45,
            chipsPerLevel: 20,
            baseMultiplier: 7,
            multiplierPerLevel: 1.5,
            maxLevel: 10
        },
        [PokerHandType.STRAIGHT_FLUSH]: {
            baseChips: 50,
            chipsPerLevel: 25,
            baseMultiplier: 8,
            multiplierPerLevel: 2,
            maxLevel: 10
        },
        [PokerHandType.ROYAL_FLUSH]: {
            baseChips: 70,
            chipsPerLevel: 30,
            baseMultiplier: 8,
            multiplierPerLevel: 2,
            maxLevel: 10
        },
        // Secret hands
        [PokerHandType.FIVE_OF_A_KIND]: {
            baseChips: 90,
            chipsPerLevel: 35,
            baseMultiplier: 12,
            multiplierPerLevel: 2.5,
            maxLevel: 10
        },
        [PokerHandType.FLUSH_HOUSE]: {
            baseChips: 80,
            chipsPerLevel: 30,
            baseMultiplier: 14,
            multiplierPerLevel: 2,
            maxLevel: 10
        },
        [PokerHandType.FLUSH_FIVE]: {
            baseChips: 100,
            chipsPerLevel: 40,
            baseMultiplier: 16,
            multiplierPerLevel: 3,
            maxLevel: 10
        }
    } as Record<PokerHandType, PokerHandLevelConfig>,
    
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
            maxDiscards: 4,
            reward: 3,
            minAnteLevel: 1
        } as BlindConfig,
        
        BIG_BLIND: {
            name: "Big Blind",
            type: BlindType.BIG_BLIND,
            baseMultiplier: 1.5, // 1.5x base chips
            description: "Blind cơ bản thứ hai của mỗi Ante",
            canSkip: true,
            initialHandSize: 8,
            maxPlays: 4,
            maxDiscards: 4,
            reward: 4,
            minAnteLevel: 1
        } as BlindConfig,
        
        // Boss Blinds
        BOSS_BLINDS: [
            {
                name: "The Hook",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Bỏ 2 lá bài ngẫu nhiên trong tay sau mỗi ván",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 1
            },
            {
                name: "The Ox",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Chơi ván bài được dùng nhiều nhất trong lượt này sẽ đặt tiền về $0",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 6
            },
            {
                name: "The House",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Ván đầu tiên được rút úp",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 2
            },
            {
                name: "The Wall",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 4.0,
                description: "Blind cuối cùng của Ante",
                effect: "Blind lớn hơn bình thường",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 2
            },
            {
                name: "The Wheel",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "1/7 lá bài được rút úp trong suốt vòng",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 2
            },
            {
                name: "The Arm",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Giảm cấp độ của ván bài poker được chơi xuống 1",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 2
            },
            {
                name: "The Club",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Tất cả lá bài Chuồn (Club) bị giảm sức mạnh",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 1
            },
            {
                name: "The Fish",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Các lá bài được rút úp sau mỗi ván chơi",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 2
            },
            {
                name: "The Psychic",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Phải chơi 5 lá bài (không cần tất cả đều tính điểm)",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 1
            },
            {
                name: "The Goad",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Tất cả lá bài Bích (Spade) bị giảm sức mạnh",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 1
            },
            {
                name: "The Water",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Bắt đầu với 0 lượt bỏ bài",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 0,
                reward: 5,
                minAnteLevel: 2
            },
            {
                name: "The Window",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Tất cả lá bài Rô (Diamond) bị giảm sức mạnh",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 1
            },
            {
                name: "The Manacle",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Giảm 1 kích thước tay bài",
                canSkip: false,
                initialHandSize: 7, // Giảm 1 so với mặc định
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 1
            },
            {
                name: "The Eye",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Không lặp lại loại ván bài trong vòng này",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 3
            },
            {
                name: "The Mouth",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Chỉ được chơi một loại ván bài trong vòng này",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 2
            },
            {
                name: "The Plant",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Tất cả lá bài mặt (face cards) bị giảm sức mạnh",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 4
            },
            {
                name: "The Serpent",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Sau khi chơi hoặc bỏ bài, luôn rút 3 lá bài",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 5
            },
            {
                name: "The Pillar",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Các lá bài đã chơi trong Ante này bị giảm sức mạnh",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 1
            },
            {
                name: "The Needle",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 1.0,
                description: "Blind cuối cùng của Ante",
                effect: "Chỉ được chơi 1 ván bài",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 1,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 2
            },
            {
                name: "The Head",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Tất cả lá bài Cơ (Heart) bị giảm sức mạnh",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 1
            },
            {
                name: "The Tooth",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Mất $1 cho mỗi lá bài được chơi",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 3
            },
            {
                name: "The Flint",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Chip cơ bản và hệ số nhân của ván bài bị giảm nửa",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 2
            },
            {
                name: "The Mark",
                type: BlindType.BOSS_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của Ante",
                effect: "Tất cả lá bài mặt được rút úp",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 5,
                minAnteLevel: 2
            }
        ] as BlindConfig[],
        
        // Finisher Blinds that appear at the final Ante
        FINISHER_BLINDS: [
            {
                name: "Amber Acorn",
                type: BlindType.FINISHER_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của run",
                effect: "Lật và xáo trộn tất cả lá bài Joker",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 8,
                minAnteLevel: 8
            },
            {
                name: "Verdant Leaf",
                type: BlindType.FINISHER_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của run",
                effect: "Tất cả lá bài bị giảm sức mạnh cho đến khi bán 1 Joker",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 8,
                minAnteLevel: 8
            },
            {
                name: "Violet Vessel",
                type: BlindType.FINISHER_BLIND,
                baseMultiplier: 6.0,
                description: "Blind cuối cùng của run",
                effect: "Blind rất lớn",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 8,
                minAnteLevel: 8
            },
            {
                name: "Crimson Heart",
                type: BlindType.FINISHER_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của run",
                effect: "Một lá Joker ngẫu nhiên bị vô hiệu hóa mỗi ván",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 8,
                minAnteLevel: 8
            },
            {
                name: "Cerulean Bell",
                type: BlindType.FINISHER_BLIND,
                baseMultiplier: 2.0,
                description: "Blind cuối cùng của run",
                effect: "Buộc luôn chọn 1 lá bài",
                canSkip: false,
                initialHandSize: 8,
                maxPlays: 4,
                maxDiscards: 4,
                reward: 8,
                minAnteLevel: 8
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
