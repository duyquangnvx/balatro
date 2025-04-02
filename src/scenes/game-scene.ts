import { GAME_CONFIG } from "../config/game-config";

import { CardArea } from "../components/areas/card-area";
import { DeckArea } from "../components/areas/deck-area";
import { HandArea, SortType } from "../components/areas/hand-area";
import { PlayArea } from "../components/areas/play-area";
import { BaseScene } from "./base-scene";
import { GameManager } from "../managers/game-manager";
import { wait } from "../utils/game-utils";
import { PlayingCard } from "../objects/playing-card";
import { ActionPanel } from "../ui/action-panel";
import { BlindPanel } from '../ui/blind-panel';
import { DiscardArea } from "../components/areas/discard-area";
import { evaluatePokerHand, getCardPointValue, getPokerHandName } from '../utils/poker-utils';
import { animateScoreText } from '../utils/animation-utils';
import { THEME_CONFIG } from "../config/theme-config";

const SCENE_CONFIG = {
    BACKGROUND: {
        x: GAME_CONFIG.SCREEN_WIDTH / 2,
        y: GAME_CONFIG.SCREEN_HEIGHT / 2,
        width: GAME_CONFIG.SCREEN_WIDTH,
        height: GAME_CONFIG.SCREEN_HEIGHT
    },
    DECK: {
        x: GAME_CONFIG.SCREEN_WIDTH - 100,
        y: GAME_CONFIG.SCREEN_HEIGHT - 120,
        width: 100,
        height: 200,
        depth: 0
    },
    HAND: {
        x: GAME_CONFIG.SCREEN_WIDTH / 2 + 80,
        y: GAME_CONFIG.SCREEN_HEIGHT - 220,
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
    PLAY: {
        x: GAME_CONFIG.SCREEN_WIDTH / 2 + 80,
        y: GAME_CONFIG.SCREEN_HEIGHT / 2 - 100,
        width: 700,
        height: 200,
        depth: 150
    },
    ACTION_PANEL: {
        x: GAME_CONFIG.SCREEN_WIDTH / 2 + 80,
        y: GAME_CONFIG.SCREEN_HEIGHT - 60,
        width: 600,
        height: 80
    },
    BLIND_PANEL: {
        x: 180,
        y: GAME_CONFIG.SCREEN_HEIGHT / 2,
        width: 300,
        height: GAME_CONFIG.SCREEN_HEIGHT
    }
}

export class GameScene extends BaseScene {
    private deckDisplay: DeckArea;
    private handDisplay: HandArea;
    private discardDisplay: DiscardArea;
    private playDisplay: PlayArea;
    private actionPanel: ActionPanel;
    private blindPanel: BlindPanel;

    private readonly gameManager: GameManager;
    constructor() {
        super({ key: 'GameScene' });
        this.gameManager = GameManager.getInstance();
    }
    
    preload(): void {
        super.preload();

        this.load.image('background', 'images/bg.png');
        
        this.load.atlas('card-fronts', 'atlases/card-fronts.png', 'atlases/card-fronts.json');
        this.load.atlas('card-backs', 'atlases/card-backs.png', 'atlases/card-backs.json');
        this.load.atlas('card-enhancements', 'atlases/card-enhancements.png', 'atlases/card-enhancements.json');
        
        // Tải font m6x11plus
        this.load.bitmapFont('m6x11plus', 'fonts/m6x11plus.png', 'fonts/m6x11plus.xml');
    }

    async create(): Promise<void> {
        // Create a background
        // const background = this.add.image(SCENE_CONFIG.BACKGROUND.x, SCENE_CONFIG.BACKGROUND.y, 'background');
        
        const background = this.add.rectangle(SCENE_CONFIG.BACKGROUND.x, SCENE_CONFIG.BACKGROUND.y, SCENE_CONFIG.BACKGROUND.width, SCENE_CONFIG.BACKGROUND.height, THEME_CONFIG.COLORS.BALATRO.GREEN);
    
        this.setupBoard();
        this.setupBlindPanel();

        await this.startNewGame();
    }

    update(): void {
        this.deckDisplay.update();
        this.handDisplay.update();
        this.discardDisplay.update();
        this.playDisplay.update();
    }
    
    private setupBoard(): void {
        const boardManager = this.gameManager.getBoardManager();
        this.deckDisplay = new DeckArea(this, SCENE_CONFIG.DECK, boardManager);
        this.deckDisplay.initCards(GAME_CONFIG.INITIAL_DECK_SIZE);
        this.deckDisplay.setAutoArrange(true);
        
        this.handDisplay = new HandArea(this, SCENE_CONFIG.HAND, boardManager);
        this.discardDisplay = new DiscardArea(this, SCENE_CONFIG.DISCARD, boardManager);
        this.playDisplay = new PlayArea(this, SCENE_CONFIG.PLAY, boardManager);
        
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

        this.handDisplay.on('card-selected-changed', this.onCardSelectedChanged, this);
    }
    
    /**
     * Setup Blind Panel for displaying game progress information
     */
    private setupBlindPanel(): void {
        // Create the blind panel
        this.blindPanel = new BlindPanel(this, SCENE_CONFIG.BLIND_PANEL);
        
        // Update the panel with current blind information
        this.updateBlindPanel();
    }

    async startNewGame(): Promise<void> {
        this.gameManager.startNewGame();
        this.gameManager.startNewRound();

        this.updateBlindPanel();

        // Update displays
        const boardManager = this.gameManager.getBoardManager();
        const initCards = boardManager.getHandCards();
        await this.animateDealCards(initCards);
    }

    /**
     * Handle play hand action
     */
    private async onPlayHand(): Promise<void> {
        const runManager = this.gameManager.getRunManager();
        if (runManager.getRemainingPlays() === 0) {
            return;
        }

        // Get selected cards
        const selectedCards = this.handDisplay.getSelectedCards();
        
        // Check if there are selected cards
        if (selectedCards.length === 0) {
            return;
        }
        
        const newCards = this.gameManager.playCards(selectedCards);

        this.handDisplay.clearSelection();

        this.blindPanel.updateHandsAndDiscards(
            runManager.getRemainingPlays(),
            runManager.getRemainingDiscards()
        );

        // Deal new cards to replace the ones played
        await this.animatePlayCards(selectedCards);
        await wait(200);
        await this.animateDealCards(newCards);
  
    }

    /**
     * Handle discard action
     */
    private async onDiscard(): Promise<void> {
        const runManager = this.gameManager.getRunManager();
        if (runManager.getRemainingDiscards() === 0) {
            return;
        }

        // Get selected cards
        const selectedCards = this.handDisplay.getSelectedCards();

          // Check if there are selected cards
        if (selectedCards.length === 0) {
            return;
        }

        // Deal new cards to replace the ones played
        const newCards = this.gameManager.discardCards(selectedCards);

        this.handDisplay.clearSelection();

        this.blindPanel.updateHandsAndDiscards(
            runManager.getRemainingPlays(),
            runManager.getRemainingDiscards()
        );

        await this.animateDiscardCards(selectedCards);
        await wait(200);
        await this.animateDealCards(newCards);
    }

    private onCardSelectedChanged(): void {
        this.updateBlindPanel();
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

    async animatePlayCards(cards: PlayingCard[]): Promise<void> {
        const cardDisplays = cards.map(card => this.handDisplay.findCardDisplay(card));

        // Hide the action panel
        this.actionPanel.setVisible(false);
        
        // Save the initial position of the hand area
        const originalPosition = this.handDisplay.getPosition();
        
        // Move the hand area down (100px away from the initial position)
        await this.handDisplay.moveTo(
            originalPosition.x, 
            originalPosition.y + 100, 
            { duration: 300, ease: 'Power2' }
        );

        await wait(500);

        // Play the cards from hand to play area
        for (const cardDisplay of cardDisplays) {
            if (cardDisplay) {
                this.handDisplay.removeCardDisplay(cardDisplay);
                this.playDisplay.addCardDisplay(cardDisplay);
    
                cardDisplay.lowerDown();

                await wait(100);
            }
        }
        
        // Pause to show the played cards
        await wait(400);
        
        // Identify the best poker hand
        const pokerHand = evaluatePokerHand(cards);
        const pokerHandCardDisplays = pokerHand.cards.map(card => this.playDisplay.findCardDisplay(card));
        
        // Sắp xếp card displays từ trái sang phải (theo giá trị x)
        pokerHandCardDisplays.sort((a, b) => {
            if (!a || !b) return 0;
            return a.x - b.x;
        });

        // Lift up the cards
        for (const cardDisplay of pokerHandCardDisplays) {
            await cardDisplay?.liftUp();
        }

        // Animate the score text
        for (const cardDisplay of pokerHandCardDisplays) {
            if (cardDisplay) {
                const card = cardDisplay.getCard();
                if (card) {
                    const points = getCardPointValue(card);
                    await animateScoreText(cardDisplay, points);
                }
            }
        }

        await wait(200);
        
        // Discard the cards from play area to discard area
        for (const cardDisplay of cardDisplays) {
            if (cardDisplay) {
                this.playDisplay.removeCardDisplay(cardDisplay);
                this.discardDisplay.addCardDisplay(cardDisplay);

                cardDisplay.setFlipped(false);
                cardDisplay.animateFlip(false);

                await wait(100);
            }
        }
        
        // Move hand area back to original position
        await this.handDisplay.moveTo(
            originalPosition.x, 
            originalPosition.y, 
            { duration: 300, ease: 'Power2' }
        );
        
        // Show the action panel after completion
        this.actionPanel.setVisible(true);
    }

    /**
     * Animate discarding cards from the hand to the discard pile
     * @param cards - The cards to discard
     */ 
    async animateDiscardCards(cards: PlayingCard[]): Promise<void> {
        for (const card of cards) {
            const cardDisplay = this.handDisplay.findCardDisplay(card);
            if (cardDisplay) {
                this.handDisplay.removeCardDisplay(cardDisplay);
                this.discardDisplay.addCardDisplay(cardDisplay);

                cardDisplay.setFlipped(false);
                cardDisplay.animateFlip(false);

                await wait(100);
            }
        }
    }  

    private updateBlindPanel(): void {
        const runManager = this.gameManager.getRunManager();

        const selectedCards = this.handDisplay.getSelectedCards();
        if (selectedCards.length > 0) {
            const pokerHand = evaluatePokerHand(selectedCards);
            const pokerHandState = runManager.getPokerHandState(pokerHand.handType);
            this.blindPanel.updatePokerHand(pokerHandState);
        }
        else {
            this.blindPanel.updatePokerHand();
        }

        this.blindPanel.updateAnteAndRound(
            runManager.getCurrentAnteIndex() + 1,
            runManager.getTotalAntes(),
            runManager.getCurrentRound()
        );
        
        this.blindPanel.updateHandsAndDiscards(
            runManager.getRemainingPlays(),
            runManager.getRemainingDiscards()
        );

        this.blindPanel.updateMoney(runManager.getMoney());
    }
}   