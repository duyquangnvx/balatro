import { PokerHandType } from "../utils/poker-utils";
import { LocalStorage } from "../utils/local-storage";

/**
 * Manager for handling run information (current game session)
 */
export class RunManager {
    private static instance: RunManager;
    
    // Level for each type of poker hand
    private handLevels: Record<PokerHandType, number> = {
        [PokerHandType.HIGH_CARD]: 1,
        [PokerHandType.PAIR]: 1,
        [PokerHandType.TWO_PAIR]: 1,
        [PokerHandType.THREE_OF_A_KIND]: 1,
        [PokerHandType.STRAIGHT]: 1,
        [PokerHandType.FLUSH]: 1,
        [PokerHandType.FULL_HOUSE]: 1,
        [PokerHandType.FOUR_OF_A_KIND]: 1,
        [PokerHandType.STRAIGHT_FLUSH]: 1,
        [PokerHandType.ROYAL_FLUSH]: 1,
        [PokerHandType.FIVE_OF_A_KIND]: 1,
        [PokerHandType.FLUSH_HOUSE]: 1,
        [PokerHandType.FLUSH_FIVE]: 1
    };
    
    private readonly STORAGE_KEYS = {
        HAND_LEVELS: 'hand_levels'
    };

    private constructor() {

    }

    /**
     * Get instance of RunManager (singleton)
     */
    public static getInstance(): RunManager {
        if (!RunManager.instance) {
            RunManager.instance = new RunManager();
        }
        return RunManager.instance;
    }
    
    public init(): void {
        this.loadData();
    }

    /**
     * Upgrade level for a specific hand type
     * @param handType Type of poker hand to upgrade
     * @param levels Number of levels to increase (default is 1)
     */
    public upgradeHandLevel(handType: PokerHandType, levels: number = 1): void {
        if (this.handLevels[handType]) {
            this.handLevels[handType] += levels;
            this.saveData();
        }
    }

    /**
     * Get current level for a specific hand type
     * @param handType Type of poker hand to check
     */
    public getHandLevel(handType: PokerHandType): number {
        return this.handLevels[handType] || 1;
    }
    
    /**
     * Start a new run
     */
    public startNewRun(): void {
        // Reset hand levels to 1
        Object.keys(this.handLevels).forEach(key => {
            this.handLevels[key as PokerHandType] = 1;
        });
        
        this.saveData();
    }
    
    /**
     * Save run data
     */
    private saveData(): void {
        const storage = LocalStorage.getInstance();
        storage.set(this.STORAGE_KEYS.HAND_LEVELS, this.handLevels);
    }

    /**
     * Load run data
     */
    private loadData(): void {
        const storage = LocalStorage.getInstance();
        const savedHandLevels = storage.get(this.STORAGE_KEYS.HAND_LEVELS) as Record<PokerHandType, number> | undefined;
        if (savedHandLevels) {
            this.handLevels = savedHandLevels;
        }
    }
} 