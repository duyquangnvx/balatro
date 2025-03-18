import { Scene } from "phaser";
import { BoardModel } from "./models/BoardModel";
import { CardView, DeckView, DiscardPileView, HandView } from "./views";
import { delay } from "../../Utils";
import { CardModel } from "./models/CardModel";

export class BoardController {
    private scene: Scene;
    private deckView!: DeckView;
    private handView!: HandView;
    private discardPileView!: DiscardPileView;
    private cardViewMap: Map<string, CardView> = new Map();

    private board: BoardModel;

    // Positions for deck and hand
    private readonly DECK_POSITION = { x: 0, y: 0 };
    private readonly HAND_POSITION = { x: 0, y: 0 };
    private readonly DISCARD_POSITION = { x: 0, y: 0 };
    private readonly DECK_DEPTH = 0;
    private readonly HAND_DEPTH = 200;
    private readonly DISCARD_DEPTH = 100;

    constructor(scene: Scene) {
        this.scene = scene;
        this.board = new BoardModel();
    }

    public initBoard(): void {
        const scene = this.scene;

        // Define positions for deck and hand
        this.DECK_POSITION.x = scene.cameras.main.width - 100;
        this.DECK_POSITION.y = scene.cameras.main.height - 120;
        
        this.HAND_POSITION.x = scene.cameras.main.width / 2;
        this.HAND_POSITION.y = scene.cameras.main.height - 200;

        this.DISCARD_POSITION.x = scene.cameras.main.width + 200;
        this.DISCARD_POSITION.y = scene.cameras.main.height - 200;

        // Create hand view
        this.handView = new HandView(this.scene, this.board.getHand(), this.HAND_POSITION.x, this.HAND_POSITION.y, this.HAND_DEPTH);

        // Create deck view
        this.deckView = new DeckView(this.scene, this.board.getDeck(), this.DECK_POSITION.x, this.DECK_POSITION.y, this.DECK_DEPTH);

        // Create discard pile view
        this.discardPileView = new DiscardPileView(this.scene, this.board.getDiscardPile(), this.DISCARD_POSITION.x, this.DISCARD_POSITION.y, this.DISCARD_DEPTH);

        this.initCardViews();
    }

    private initCardViews(): void {
        const cards = this.board.getAllCards();
        cards.forEach(card => {
            const cardView = new CardView(this.scene, card);
            this.cardViewMap.set(card.id, cardView);
        });
    }

    public newGame(): void {
        this.board.newGame();
        const deck = this.board.getDeck();

        // Update views
        const cards = deck.getRemainingCards();
        cards.forEach(card => {
            const cardView = this.getCardViewByCardId(card.id);
            if (cardView) {
                this.deckView.addCardView(cardView);
            }
        });
        this.deckView.updateView();

        this.handView.setCardViews([]);
        this.handView.updateView();

        this.discardPileView.setCardViews([]);
        this.discardPileView.updateView();
    }

    public async startGame(): Promise<void> {
        const initCards = this.board.drawInitCards();

        let index = 0;
        for (const card of initCards) {
            const cardView = this.deckView.popTopCard();
            if (cardView) {
                cardView.setModel(card);
                cardView.animateFlip(true);   // CardView will updateView() on animateFlip()
                
                this.handView.addCardView(cardView);
                this.handView.animateDrawCard(cardView);
                await delay(200);
                index++;
            }
        }
    }

    public async playSelectedCards(): Promise<void> {
        // Get selected cards from hand before playing them
        const selectedCards = this.board.getHand().getSelectedCards();
        const centerY = this.scene.cameras.main.height / 2;
        const cardViews: CardView[] = [];

        // Collect all selected card views
        for (const card of selectedCards) {
            const cardView = this.getCardViewByCardId(card.id);
            if (cardView) {
                cardViews.push(cardView);
            }
        }

        // Sort card views by x position (left to right)
        cardViews.sort((a, b) => a.x - b.x);

        // Calculate positions for centered arrangement
        const cardWidth = cardViews[0].width;
        const spacing = cardWidth + 20; // 20px gap between cards
        const totalWidth = spacing * (cardViews.length - 1) + cardWidth;
        const startX = (this.scene.cameras.main.width - totalWidth) / 2;

        // 1. Animate all cards moving up to center screen
        for (let i = 0; i < cardViews.length; i++) {
            const cardView = cardViews[i];
            const targetX = startX + (spacing * i);
            
            // Remove from hand and animate moving up
            this.handView.removeCardView(cardView);
            cardView.animateMoveTo(targetX, centerY);
            await delay(100); // Small delay between each card moving up
        }

        // Wait for all cards to finish moving up
        await delay(400);

        // 2. Animate scores for all cards
        for (const cardView of cardViews) {
            const score = this.calculateCardScore(cardView.getModel());
            cardView.animateScore(score);
            await delay(100); // Small delay between each score animation
        }

        // Wait for score animations to complete
        await delay(800);

        // 3. Animate all cards to discard pile
        for (const cardView of cardViews) {
            this.discardPileView.addCardView(cardView);
            cardView.animateFlip(false);
            this.discardPileView.animateDiscardCard(cardView);
            await delay(100); // Small delay between each discard animation
        }

        // Execute the play action after animations
        this.board.playSelectedCards();

        // Rearrange remaining cards in hand
        this.handView.animateArrangeCards(false);
        await delay(200);

        // 4. Draw new cards from deck
        const newCards = this.board.drawCards(selectedCards.length);
        for (const card of newCards) {
            const cardView = this.getCardViewByCardId(card.id);
            if (cardView) {
                cardView.setModel(card);
                cardView.animateFlip(true);   // CardView will updateView() on animateFlip()
                
                this.handView.addCardView(cardView);
                this.handView.animateDrawCard(cardView);
                await delay(200);
            }
        }
    }

    /**
     * Calculate score for a card (demo implementation)
     * @param card The card to calculate score for
     * @returns The score value
     */
    private calculateCardScore(card: CardModel): number {
        const rank = card.getRank();
        switch (rank) {
            case 'A': return 11;
            case 'K':
            case 'Q':
            case 'J': return 10;
            default: return parseInt(rank) || 0;
        }
    }

    public async discardSelectedCards(): Promise<void> {
        const discardedCards = this.board.discardSelectedCards();

        for (const card of discardedCards) {
            const cardView = this.getCardViewByCardId(card.id);
            if (cardView) {
                this.discardPileView.addCardView(cardView);
                this.handView.removeCardView(cardView);

                cardView.animateFlip(false);
                this.discardPileView.animateDiscardCard(cardView);
                this.handView.animateArrangeCards(false);
                await delay(200);
            }
        }

        const newCards = this.board.drawCards(discardedCards.length);
        for (const card of newCards) {
            const cardView = this.getCardViewByCardId(card.id);
            if (cardView) {
                cardView.setModel(card);
                cardView.animateFlip(true);   // CardView will updateView() on animateFlip()
                
                this.handView.addCardView(cardView);
                this.handView.animateDrawCard(cardView);
                await delay(200);
            }
        }
    }

    public async resetGame(): Promise<void> {
        this.board.newGame();

        const discardedCards = this.discardPileView.getCardViews();
        for (const cardView of discardedCards) {
            this.discardPileView.removeCardView(cardView);

            cardView.animateFlip(false);

            this.deckView.addCardView(cardView);
            this.deckView.animateReturnCard(cardView);
            await delay(200);
        }
    }

    public getCardViewByCardId(cardId: string): CardView | undefined {
        return this.cardViewMap.get(cardId);
    }

    public sortCardsByRank(): void {
        this.board.getHand().sortByRank();
        this.handView.sortCardViews();
        this.handView.animateArrangeCards();
    }

    public sortCardsBySuit(): void {    
        this.board.getHand().sortBySuit();
        this.handView.sortCardViews();
        this.handView.animateArrangeCards();
    }

    public destroy(): void {
        this.cardViewMap.forEach(cardView => cardView.destroy());
        this.cardViewMap.clear();

        this.handView.destroy();
        this.deckView.destroy();
        this.discardPileView.destroy();
    }
}
