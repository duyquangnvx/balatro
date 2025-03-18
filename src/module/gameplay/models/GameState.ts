export class GameState {
    private _money: number = 0;
    private _currentScore: number = 0;
    private _requiredScore: number = 0;
    private _remainingDiscards: number = 0;
    private _remainingPlays: number = 0;

    constructor(initialMoney: number = 0, requiredScore: number = 0, maxDiscards: number = 3, maxPlays: number = 1) {
        this._money = initialMoney;
        this._requiredScore = requiredScore;
        this._remainingDiscards = maxDiscards;
        this._remainingPlays = maxPlays;
    }

    // Getters
    get money(): number {
        return this._money;
    }

    get currentScore(): number {
        return this._currentScore;
    }

    get requiredScore(): number {
        return this._requiredScore;
    }

    get remainingDiscards(): number {
        return this._remainingDiscards;
    }

    get remainingPlays(): number {
        return this._remainingPlays;
    }

    // Setters with validation
    set money(value: number) {
        this._money = Math.max(0, value);
    }

    set currentScore(value: number) {
        this._currentScore = Math.max(0, value);
    }

    set requiredScore(value: number) {
        this._requiredScore = Math.max(0, value);
    }

    // Methods to modify state
    useDiscard(): boolean {
        if (this._remainingDiscards > 0) {
            this._remainingDiscards--;
            return true;
        }
        return false;
    }

    usePlay(): boolean {
        if (this._remainingPlays > 0) {
            this._remainingPlays--;
            return true;
        }
        return false;
    }

    addMoney(amount: number): void {
        this._money += amount;
    }

    spendMoney(amount: number): boolean {
        if (this._money >= amount) {
            this._money -= amount;
            return true;
        }
        return false;
    }

    addScore(points: number): void {
        this._currentScore += points;
    }

    resetTurn(maxDiscards: number = 3, maxPlays: number = 1): void {
        this._remainingDiscards = maxDiscards;
        this._remainingPlays = maxPlays;
    }

    isLevelComplete(): boolean {
        return this._currentScore >= this._requiredScore;
    }
} 