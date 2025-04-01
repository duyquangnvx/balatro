/**
 * Interface for updatable objects
 */
export interface IUpdatable {
    update(time: number, delta: number): void;
}

/**
 * Class managing game loop and updating objects
 */
export class GameLoop {
    private static instance: GameLoop | undefined;
    
    private game: Phaser.Game;
    private updatables: Map<string, IUpdatable>;
    private lastTime: number;
    private paused: boolean;
    private fps: number;
    private timeScale: number;
    
    private constructor(game: Phaser.Game) {
        this.game = game;
        this.updatables = new Map();
        this.lastTime = 0;
        this.paused = false;
        this.fps = 60;
        this.timeScale = 1.0;
        
        // Listen to update events from Phaser
        this.game.events.on('prestep', this.preUpdate, this);
        this.game.events.on('step', this.update, this);
        this.game.events.on('poststep', this.postUpdate, this);
        
        // Track when scene changes or is destroyed
        this.game.events.on('destroy', this.onGameDestroy, this);
    }
    
    /**
     * Initialize singleton instance
     */
    public static init(game: Phaser.Game): GameLoop {
        if (!GameLoop.instance) {
            GameLoop.instance = new GameLoop(game);
        }
        return GameLoop.instance;
    }
    
    /**
     * Get current instance
     */
    public static getInstance(): GameLoop {
        if (!GameLoop.instance) {
            throw new Error('GameLoop chưa được khởi tạo. Gọi GameLoop.init(game) trước.');
        }
        return GameLoop.instance;
    }
    
    /**
     * Add an object to update
     */
    public addUpdatable(id: string, updatable: IUpdatable): this {
        this.updatables.set(id, updatable);
        return this;
    }
    
    /**
     * Remove an object from the update list
     */
    public removeUpdatable(id: string): this {
        this.updatables.delete(id);
        return this;
    }

    /**
     * Call before update
     */
    private preUpdate(time: number, delta: number): void {
        if (this.paused) return;
        
        // Adjust delta by timeScale
        delta *= this.timeScale;
        
        // Calculate actual FPS
        if (this.lastTime > 0) {
            const frameTime = time - this.lastTime;
            if (frameTime > 0) {
                this.fps = Math.round(1000 / frameTime);
            }
        }
        this.lastTime = time;
    }
    
    /**
     * Update all registered objects
     */
    private update(time: number, delta: number): void {
        if (this.paused) return;
        
        // Adjust delta by timeScale
        delta *= this.timeScale;
        
        // Update other objects
        this.updatables.forEach(updatable => {
            updatable.update(time, delta);
        });
    }
    
    /**
     * Call after update
     */
    private postUpdate(time: number, delta: number): void {
        if (this.paused) return;
        
        // Process after update if needed
    }
    
    /**
     * Pause game loop
     */
    public pause(): this {
        this.paused = true;
        return this;
    }
    
    /**
     * Resume game loop
     */
    public resume(): this {
        this.paused = false;
        return this;
    }
    
    /**
     * Set game speed (timeScale)
     */
    public setTimeScale(scale: number): this {
        this.timeScale = Math.max(0.1, Math.min(10, scale));
        return this;
    }
    
    /**
     * Get current FPS
     */
    public getFPS(): number {
        return this.fps;
    }
    
    /**
     * Get current timeScale
     */
    public getTimeScale(): number {
        return this.timeScale;
    }
    
    /**
     * Handle when game is destroyed
     */
    private onGameDestroy(): void {
        // Unregister events
        this.game.events.off('prestep', this.preUpdate, this);
        this.game.events.off('step', this.update, this);
        this.game.events.off('poststep', this.postUpdate, this);
        this.game.events.off('destroy', this.onGameDestroy, this);
        
        // Clear references
        this.updatables.clear();
        
        // Reset instance
        GameLoop.instance = undefined;
    }
} 