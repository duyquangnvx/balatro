import { PokerHandType } from "../utils/poker-utils";
import { LocalStorage } from "../utils/local-storage";
import { GAME_CONFIG, BlindType, BlindConfig, AnteConfig } from "../config/game-config";
import { calculatePokerHandScore } from "../utils/scoring";
import { PlayingCard } from "../objects/playing-card";

export type PokerHandState = {
    handType: PokerHandType;
    level: number;
    chips: number;
    multiplier: number;
}

export type PlayedHistory = {
    handType: PokerHandType;
    cards: PlayingCard[];
    score: number;
    chips: number;
    multiplier: number;
}

/**
 * Current state of a Blind
 */
export interface BlindState {
    config: BlindConfig;
    requiredScore: number; // Required score
    currentScore: number; // Current score
    completed: boolean; // Completed
    skipped: boolean; // Skipped

    initialHandSize: number;
    
    remainingPlays: number;
    remainingDiscards: number;
    maxPlays: number;   
    maxDiscards: number;
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
    pokerHandLevels: Record<PokerHandType, number>;
}

/**
 * Manage information about the current run (a game session)
 */
export class RunManager {
    private static instance: RunManager;

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

    public getRunState(): RunState {
        return this.runState;
    }
    
    /**
     * Upgrade level for a specific hand type
     * @param handType Hand type to upgrade
     * @param levels Number of levels to increase (default is 1)
     */
    public upgradeHandLevel(handType: PokerHandType, levels: number = 1): void {
        if (this.runState.pokerHandLevels[handType]) {
            this.runState.pokerHandLevels[handType] += levels;
            this.saveData();
        }
    }

    /**
     * Get current level for a specific hand type
     * @param handType Hand type to check
     */
    public getHandLevel(handType: PokerHandType): number {
        return this.runState.pokerHandLevels[handType] || 1;
    }

    public getPokerHandState(handType: PokerHandType): PokerHandState {
        const { chips, multiplier } = calculatePokerHandScore(handType, this.runState);
        return {
            handType: handType,
            level: this.getHandLevel(handType),
            chips: chips,
            multiplier: multiplier
        }
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
     * Start a new run
     */
    public startNewRun(): void {
        // Reset to first Ante, first Blind
        this.runState = this.createDefaultRunState();
        
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
                smallBlind: this.createBlindState(anteConfig, smallBlindConfig),
                bigBlind: this.createBlindState(anteConfig, bigBlindConfig),
                bossBlind: this.createBlindState(anteConfig, bossBlindConfig),
                completed: false
            };
        });

        // @ts-ignore
        const pokerHandLevels: Record<PokerHandType, number> = {};
        Object.keys(GAME_CONFIG.POKER_HAND_LEVELS).forEach(key => {
            pokerHandLevels[key as PokerHandType] = 1;
        });

        return {
            currentAnteIndex: 0,
            currentBlindIndex: 0,
            antes: antes,
            money: GAME_CONFIG.STARTING_MONEY,
            pokerHandLevels: pokerHandLevels
        };
    }
    
    /**
     * Save run data
     */
    private saveData(): void {
        const storage = LocalStorage.getInstance();
        storage.set(this.STORAGE_KEYS.RUN_STATE, this.runState);
    }

    /**
     * Load run data
     */
    private loadData(): void {
        const storage = LocalStorage.getInstance();

        const savedRunState = storage.get(this.STORAGE_KEYS.RUN_STATE) as RunState | undefined;
        if (savedRunState) {
            this.runState = savedRunState;
        }
    }

    /**
     * Get the current ante index (0-based)
     */
    public getCurrentAnteIndex(): number {
        return this.runState.currentAnteIndex;
    }
    
    /**
     * Get total number of antes in the run
     */
    public getTotalAntes(): number {
        return this.runState.antes.length;
    }
    
    /**
     * Get the current round (1-based)
     * In this implementation, we simply count rounds as ante index + 1
     */
    public getCurrentRound(): number {
        return this.runState.currentAnteIndex + 1;
    }
    
    /**
     * Get remaining hands for current blind/ante
     * This is a placeholder - update with actual logic
     */
    public getRemainingPlays(): number {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return 0;
        
        return currentBlind.remainingPlays;
    }
    
    /**
     * Get remaining discards for current blind/ante
     * This is a placeholder - update with actual logic
     */
    public getRemainingDiscards(): number {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return 0;
        
        return currentBlind.remainingDiscards;
    }
    
    /**
     * Get maximum number of plays for current blind
     * @returns Maximum number of plays
     */
    public getMaxPlays(): number {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return 0;
        
        return currentBlind.maxPlays;
    }

    /**
     * Get maximum number of discards for current blind
     * @returns Maximum number of discards
     */
    public getMaxDiscards(): number {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return 0;
        
        return currentBlind.maxDiscards;
    }

    public usePlay(): void {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return;
        
        currentBlind.remainingPlays--;
    }

    public useDiscard(): void {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return;
        
        currentBlind.remainingDiscards--;
    }

    /**
     * Get the hand size for the current blind
     * @returns Hand size
     */
    public getHandSize(): number {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return 0;
        
        return currentBlind.initialHandSize;
    }

    public addScore(score: number): void {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return;
        
        currentBlind.currentScore += score;
    }

    public getCurrentScore(): number {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return 0;
        
        return currentBlind.currentScore;
    }

    /**
     * Check if the current blind is completed
     * @returns true if the score is enough to complete the blind
     */
    public isCurrentBlindCompleted(): boolean {
        const currentBlind = this.getCurrentBlind();
        if (!currentBlind) return false;
        
        return currentBlind.currentScore >= currentBlind.requiredScore;
    }

    private createBlindState(anteConfig: AnteConfig, blindConfig: BlindConfig): BlindState {
        return {
            config: blindConfig,
            requiredScore: blindConfig.baseMultiplier * anteConfig.baseChips,
            currentScore: 0,
            completed: false,
            skipped: false,
            initialHandSize: blindConfig.initialHandSize,
            remainingPlays: blindConfig.maxPlays,
            remainingDiscards: blindConfig.maxDiscards,
            maxPlays: blindConfig.maxPlays,
            maxDiscards: blindConfig.maxDiscards
        };
    }
} 

