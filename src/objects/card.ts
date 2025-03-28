export class Card {
    public readonly id: string;

    private flipped: boolean;

    constructor() {
        this.id = crypto.randomUUID();
        this.flipped = false;
    }

    public getId(): string {
        return this.id;
    }

    public isFlipped(): boolean {
        return this.flipped;
    }

    public flip(): void {
        this.setFlipped(!this.flipped);
    }

    public setFlipped(flipped: boolean): void {
        this.flipped = flipped;
    }
}



