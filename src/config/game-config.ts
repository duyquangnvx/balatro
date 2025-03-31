import { PokerHandType } from "../utils/poker-utils";

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
        // Điểm cho các bài bí mật
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
        // Hệ số nhân cho các bài bí mật
        [PokerHandType.FIVE_OF_A_KIND]: 10,
        [PokerHandType.FLUSH_HOUSE]: 9,
        [PokerHandType.FLUSH_FIVE]: 15
    } as Record<PokerHandType, number>
}
