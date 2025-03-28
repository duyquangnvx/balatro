import { Scene } from "phaser";
import { getCardEnhancementFrame } from "../../utils/card-helpers";
import { getCardFrontFrame } from "../../utils/card-helpers";
import { getCardBackFrame } from "../../utils/card-helpers";

export class Card extends Phaser.GameObjects.Container {
    protected readonly id: string;

    // Basic card properties
    private flipped: boolean;

    constructor(scene: Scene) {
        super(scene);
        scene.add.existing(this);

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



