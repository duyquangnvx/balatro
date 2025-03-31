import { GAME_CONFIG } from "../config/game-config";

import { CardArea } from "../components/areas/card-area";
import { DeckArea } from "../components/areas/deck-area";
import { HandArea, SortType } from "../components/areas/hand-area";
import { BaseScene } from "./base-scene";
import { GameManager } from "../managers/game-manger";
import { BoardManager } from "../managers/board-manager";
import { wait } from "../utils/game-utils";
import { PlayingCard } from "../objects/playing-card";
import { ActionPanel } from "../ui/action-panel";
import { Toast } from "../ui/toast";

const SCENE_CONFIG = {
    DECK: {
        x: GAME_CONFIG.SCREEN_WIDTH - 100,
        y: GAME_CONFIG.SCREEN_HEIGHT - 120,
        width: 100,
        height: 200,
        depth: 0
    },
    HAND: {
        x: GAME_CONFIG.SCREEN_WIDTH / 2,
        y: GAME_CONFIG.SCREEN_HEIGHT - 200,
        width: 600,
        height: 200,
        depth: 200,
        maxSelectedCards: GAME_CONFIG.MAX_SELECTED_CARDS
    },
    DISCARD: {
        x: GAME_CONFIG.SCREEN_WIDTH + 200,   
        y: GAME_CONFIG.SCREEN_HEIGHT - 200,
        width: 100,
        height: 200,
        depth: 100
    },
    ACTION_PANEL: {
        x: GAME_CONFIG.SCREEN_WIDTH / 2,
        y: GAME_CONFIG.SCREEN_HEIGHT - 60,
        width: 600,
        height: 80
    }
}

export class GameScene extends BaseScene {
    private deckDisplay: DeckArea;
    private handDisplay: HandArea;
    private discardDisplay: CardArea;
    private actionPanel: ActionPanel;

    private readonly gameManager: GameManager;
    private readonly boardManager: BoardManager;

    constructor() {
        super({ key: 'GameScene' });
        this.gameManager = GameManager.getInstance();
        this.boardManager = new BoardManager();
    }
    
    preload(): void {
        super.preload();

        this.load.image('background', 'images/bg.png');
        
        this.load.atlas('card-fronts', 'atlases/card-fronts.png', 'atlases/card-fronts.json');
        this.load.atlas('card-backs', 'atlases/card-backs.png', 'atlases/card-backs.json');
        this.load.atlas('card-enhancements', 'atlases/card-enhancements.png', 'atlases/card-enhancements.json');
    }

    async create(): Promise<void> {
        // Create a background
        const width = GAME_CONFIG.SCREEN_WIDTH;  
        const height = GAME_CONFIG.SCREEN_HEIGHT;
        this.add.image(width / 2, height / 2, 'background');

        this.setupBoard();

        this.newGame();
    }

    update(): void {
        this.deckDisplay.update();
        this.handDisplay.update();
        this.discardDisplay.update();
    }
    
    private setupBoard(): void {
        this.deckDisplay = new DeckArea(this, SCENE_CONFIG.DECK);
        this.deckDisplay.initCards(GAME_CONFIG.INITIAL_DECK_SIZE);
        this.deckDisplay.setAutoArrange(true);
        

        this.handDisplay = new HandArea(this, SCENE_CONFIG.HAND);
        this.discardDisplay = new CardArea(this, SCENE_CONFIG.DISCARD);
        
        // Initialize the action panel
        this.actionPanel = new ActionPanel(this, {
            x: SCENE_CONFIG.ACTION_PANEL.x,
            y: SCENE_CONFIG.ACTION_PANEL.y,
            width: SCENE_CONFIG.ACTION_PANEL.width,
            height: SCENE_CONFIG.ACTION_PANEL.height,
            onPlayHand: () => this.onPlayHand(),
            onDiscard: () => this.onDiscard(),
            onSortByRank: () => this.handDisplay.applySorting(SortType.BY_RANK),
            onSortBySuit: () => this.handDisplay.applySorting(SortType.BY_SUIT)
        });
        
        // Link the action panel to the hand area
        this.actionPanel.setHandArea(this.handDisplay);
    }

    async newGame(): Promise<void> {
        this.boardManager.newGame();

        // Update displays
        const initCards = this.boardManager.getHandCards();
        await this.animateDealCards(initCards);
    }

    /**
     * Animate dealing cards from the deck to the hand
     * @param cards - The cards to deal
     */
    private async animateDealCards(cards: PlayingCard[]): Promise<void> {
        for (const card of cards) {
            const cardDisplay = this.deckDisplay.drawCard();
            if (cardDisplay) {
                cardDisplay.setCard(card);
                cardDisplay.setFlipped(true);
                cardDisplay.animateFlip(true);
                this.handDisplay.addCardDisplay(cardDisplay);

                // Wait for the card to be flipped and added to the hand
                await wait(100);
            }
        }
    }

    /**
     * Handler for Play Hand button
     */
    private onPlayHand(): void {
        const selectedCards = this.handDisplay.getSelectedCards();
        if (selectedCards.length > 0) {
            const cards = selectedCards.map(display => display.getCard()).filter(card => card !== undefined) as PlayingCard[];
            this.animatePlayCards(cards);
        }
    }

    /**
     * Handler for Discard button
     */
    private onDiscard(): void {
        const selectedCards = this.handDisplay.getSelectedCards();
        if (selectedCards.length > 0) {
            const cards = selectedCards.map(display => display.getCard()).filter(card => card !== undefined) as PlayingCard[];
            this.animateDiscardCards(cards);
            
            
        }
    }

    async animatePlayCards(cards: PlayingCard[]): Promise<void> {
        for (const card of cards) {
            const cardDisplay = this.handDisplay.findCardDisplay(card);
            if (cardDisplay) {
                // todo: Animate card playing
            }
        }
    } 

    /**
     * Animate discarding cards from the hand to the discard pile
     * @param cards - The cards to discard
     */ 
    async animateDiscardCards(cards: PlayingCard[]): Promise<void> {
        for (const card of cards) {
            const cardDisplay = this.handDisplay.findCardDisplay(card);
            if (cardDisplay) {
                cardDisplay.setFlipped(false);
                cardDisplay.animateFlip(false);
                this.discardDisplay.addCardDisplay(cardDisplay);
                await wait(100);
            }
        }
    }  
}   
