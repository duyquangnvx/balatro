import { Scene } from 'phaser';
import { CardView } from "./CardView";

export abstract class CardViewsContainer {
    protected scene: Scene;
    protected cardViews: CardView[] = [];
    protected cardAreaX: number;
    protected cardAreaY: number;

    constructor(scene: Scene, cardAreaX: number, cardAreaY: number) {
        this.scene = scene;
        this.cardAreaX = cardAreaX;
        this.cardAreaY = cardAreaY;
    }

    public setCardViews(cardViews: CardView[]): void {
        this.cardViews = cardViews;
        this.cardViews.forEach(cardView => cardView.on('click', this.onCardClicked.bind(this)));
    }

    public getCardViews(): CardView[] {
        return this.cardViews;
    }

    public addCardView(cardView: CardView): void {
        if (!this.cardViews.includes(cardView)) {
            this.cardViews.push(cardView);
        }
        cardView.on('click', this.onCardClicked.bind(this));
    }

    public removeCardView(cardView: CardView): void {
        this.cardViews = this.cardViews.filter(view => view !== cardView);
        cardView.off('click', this.onCardClicked.bind(this));
    }

    public hasCardView(cardView: CardView): boolean {
        return this.cardViews.includes(cardView);
    }

    public updateCardViews(): void {
        this.cardViews.forEach(cardView => cardView.updateView());
    }

    protected onCardClicked(cardView: CardView) : void
    {
        console.log('Card clicked:', cardView.getModel());
    }

    public reset(): void {
        this.cardViews.length = 0;
    }

    public destroy(): void {
        this.cardViews.length = 0;
    }
}
