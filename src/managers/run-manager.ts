import { PokerHandType } from "../utils/poker-utils";
import { LocalStorage } from "../utils/local-storage";
import { GAME_CONFIG, BlindType, BlindConfig, AnteConfig } from "../config/game-config";

/**
 * Current state of a Blind
 */
export interface BlindState {
    config: BlindConfig;
    requiredScore: number; // Required score
    completed: boolean; // Completed
    skipped: boolean; // Skipped
}

/**
 * Current state of an Ante
 */
export interface AnteState {
    config: AnteConfig;
    smallBlind: BlindState;
    bigBlind: BlindState;
    bossBlind: BlindState;
    completed: boolean; // Completed all 3 Blinds
}

/**
 * State of a run
 */
export interface RunState {
    currentAnteIndex: number;
    currentBlindIndex: number; // 0: Small, 1: Big, 2: Boss
    antes: AnteState[];
    money: number;
}

/**
 * Manage information about the current run (a game session)
 */
export class RunManager {
    private static instance: RunManager;
    
    // Level for each poker hand type
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
    
    // State of the current run
    private runState: RunState;
    
    private readonly STORAGE_KEYS = {
        HAND_LEVELS: 'hand_levels',
        RUN_STATE: 'run_state'
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
        this.runState = this.createDefaultRunState();
        this.loadData();
    }
    
    /**
     * Upgrade level for a specific hand type
     * @param handType Hand type to upgrade
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
     * @param handType Hand type to check
     */
    public getHandLevel(handType: PokerHandType): number {
        return this.handLevels[handType] || 1;
    }
    
    /**
     * Get current money in run
     */
    public getMoney(): number {
        return this.runState.money;
    }
    
    /**
     * Update money in run
     * @param amount Amount to change (positive is add, negative is subtract)
     */
    public updateMoney(amount: number): void {
        this.runState.money += amount;
        this.saveData();
    }
    
    /**
     * Get current Ante
     */
    public getCurrentAnte(): AnteState | null {
        if (this.runState.currentAnteIndex >= 0 && 
            this.runState.currentAnteIndex < this.runState.antes.length) {
            return this.runState.antes[this.runState.currentAnteIndex];
        }
        return null;
    }
    
    /**
     * Get current Blind
     */
    public getCurrentBlind(): BlindState | null {
        const currentAnte = this.getCurrentAnte();
        if (!currentAnte) return null;
        
        switch (this.runState.currentBlindIndex) {
            case 0: return currentAnte.smallBlind;
            case 1: return currentAnte.bigBlind;
            case 2: return currentAnte.bossBlind;
            default: return null;
        }
    }
    
    /**
     * Check if current blind can be skipped
     */
    public canSkipCurrentBlind(): boolean {
        const currentBlind = this.getCurrentBlind();
        return currentBlind ? currentBlind.config.canSkip : false;
    }
    
    /**
     * Check if there are any blinds left to pass in the current Ante
     */
    public hasMoreBlindsInCurrentAnte(): boolean {
        const currentAnte = this.getCurrentAnte();
        if (!currentAnte) return false;
        
        // Check from current blind to the end of Ante
        for (let i = this.runState.currentBlindIndex; i <= 2; i++) {
            let blind: BlindState;
            switch (i) {
                case 0: blind = currentAnte.smallBlind; break;
                case 1: blind = currentAnte.bigBlind; break;
                case 2: blind = currentAnte.bossBlind; break;
                default: continue;
            }
            
            if (!blind.completed && !blind.skipped) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Advance to next Blind in Ante, or next Ante if all Blinds are completed
     * @returns true if there are more Blinds/Antes, false if run is finished
     */
    public advanceToNextBlind(): boolean {
        const currentAnte = this.getCurrentAnte();
        if (!currentAnte) return false;
        
        // Advance to next Blind in Ante
        this.runState.currentBlindIndex++;
        
        // If all Blinds are completed in current Ante
        if (this.runState.currentBlindIndex > 2) {
            currentAnte.completed = true;
            this.runState.currentAnteIndex++;
            this.runState.currentBlindIndex = 0;
            
            // Check if all Antes are completed
            if (this.runState.currentAnteIndex >= this.runState.antes.length) {
                // Run is finished
                return false;
            }
        }
        
        this.saveData();
        return true;
    }
    
    /**
     * Skip current Blind (only applies to Small Blind and Big Blind)
     * @returns true if skipped successfully, false if cannot skip
     */
    public skipCurrentBlind(): boolean {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind || !currentBlind.config.canSkip) {
            return false;
        }
        
        currentBlind.skipped = true;
        return this.advanceToNextBlind();
    }
    
    /**
     * Check if the score has passed the current Blind
     * @param score Score achieved
     * @returns true if enough score to pass Blind, false if not enough
     */
    public checkBlindCompleted(score: number): boolean {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return false;
        
        if (score >= currentBlind.requiredScore) {
            currentBlind.completed = true;
            
            // Add reward (simple value for demo purposes)
            const reward = Math.floor(currentBlind.requiredScore * 0.2);
            this.updateMoney(reward);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Start a new run
     */
    public startNewRun(): void {
        // Reset to first Ante, first Blind
        this.runState = this.createDefaultRunState();
        
        // Reset hand levels to 1
        Object.keys(this.handLevels).forEach(key => {
            this.handLevels[key as PokerHandType] = 1;
        });
        
        this.saveData();
    }
    
    /**
     * Create default run state for a new run
     */
    private createDefaultRunState(): RunState {
        const anteConfigs = GAME_CONFIG.ANTES;
        const smallBlindConfig = GAME_CONFIG.BLINDS.SMALL_BLIND;
        const bigBlindConfig = GAME_CONFIG.BLINDS.BIG_BLIND;
        const bossBlindConfigs = GAME_CONFIG.BLINDS.BOSS_BLINDS;
        
        // Create Antes
        const antes: AnteState[] = anteConfigs.map((anteConfig, index) => {
            // Choose a random Boss Blind from the list
            const isLastAnte = index === anteConfigs.length - 1;
            let bossBlindConfig: BlindConfig;
            
            if (isLastAnte) {
                // If it's the last Ante, choose Finisher Blind
                const finisherBlindConfigs = GAME_CONFIG.BLINDS.FINISHER_BLINDS;
                const randomIndex = Math.floor(Math.random() * finisherBlindConfigs.length);
                bossBlindConfig = finisherBlindConfigs[randomIndex];
            } else {
                // Choose a random Boss Blind
                const randomIndex = Math.floor(Math.random() * bossBlindConfigs.length);
                bossBlindConfig = bossBlindConfigs[randomIndex];
            }
            
            // Create Ante State
            return {
                config: anteConfig,
                smallBlind: {
                    config: smallBlindConfig,
                    requiredScore: Math.floor(anteConfig.baseChips * smallBlindConfig.baseMultiplier),
                    completed: false,
                    skipped: false
                },
                bigBlind: {
                    config: bigBlindConfig,
                    requiredScore: Math.floor(anteConfig.baseChips * bigBlindConfig.baseMultiplier),
                    completed: false,
                    skipped: false
                },
                bossBlind: {
                    config: bossBlindConfig,
                    requiredScore: Math.floor(anteConfig.baseChips * bossBlindConfig.baseMultiplier),
                    completed: false,
                    skipped: false
                },
                completed: false
            };
        });
        
        return {
            currentAnteIndex: 0,
            currentBlindIndex: 0,
            antes: antes,
            money: GAME_CONFIG.STARTING_MONEY
        };
    }
    
    /**
     * Save run data
     */
    private saveData(): void {
        const storage = LocalStorage.getInstance();
        storage.set(this.STORAGE_KEYS.HAND_LEVELS, this.handLevels);
        storage.set(this.STORAGE_KEYS.RUN_STATE, this.runState);
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
        
        const savedRunState = storage.get(this.STORAGE_KEYS.RUN_STATE) as RunState | undefined;
        if (savedRunState) {
            this.runState = savedRunState;
        }
    }
} 