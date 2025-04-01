import { GAME_CONFIG } from "../config/game-config";

import { CardArea } from "../components/areas/card-area";
import { DeckArea } from "../components/areas/deck-area";
import { HandArea, SortType } from "../components/areas/hand-area";
import { BaseScene } from "./base-scene";
import { GameManager } from "../managers/game-manger";
import { BoardManager } from "../managers/board-manager";
import { ScoreManager } from "../managers/score-manager";
import { RunManager } from "../managers/run-manager";
import { wait } from "../utils/game-utils";
import { PlayingCard } from "../objects/playing-card";
import { ActionPanel } from "../ui/action-panel";
import { PlayingCardDisplay } from "../components/playing-card-display";
import { Toast } from "../ui/toast";
import { BlindPanel } from '../ui/blind-panel';

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
    },
    BLIND_PANEL: {
        x: 200,
        y: GAME_CONFIG.SCREEN_HEIGHT / 2,
        width: 300,
        height: GAME_CONFIG.SCREEN_HEIGHT
    }
}

export class GameScene extends BaseScene {
    private deckDisplay: DeckArea;
    private handDisplay: HandArea;
    private discardDisplay: CardArea;
    private actionPanel: ActionPanel;
    private blindPanel: BlindPanel;

    private readonly gameManager: GameManager;
    private readonly boardManager: BoardManager;
    private readonly scoreManager: ScoreManager;
    private readonly runManager: RunManager;

    constructor() {
        super({ key: 'GameScene' });
        this.gameManager = GameManager.getInstance();
        this.boardManager = new BoardManager();
        this.scoreManager = ScoreManager.getInstance();
        this.runManager = RunManager.getInstance();
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
        const background = this.add.image(SCENE_CONFIG.BACKGROUND.x, SCENE_CONFIG.BACKGROUND.y, 'background');
        background.setDisplaySize(SCENE_CONFIG.BACKGROUND.width, SCENE_CONFIG.BACKGROUND.height);

        this.setupBoard();
        this.setupBlindPanel();

        // Initialize ScoreManager and RunManager for new game
        this.scoreManager.startNewGame();
        this.runManager.startNewRun();
        this.newGame();
        
        // Thêm nút để chuyển đến TestScene
        const testButton = this.add.text(this.cameras.main.width - 150, 10, 'TEST CONTAINERS', 
            { fontSize: '14px', backgroundColor: '#333333', color: '#ffffff' })
            .setPadding(8)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('TestScene');
            });
    }

    update(): void {
        this.deckDisplay.update();
        this.handDisplay.update();
        this.discardDisplay.update();
    }
    
    private setupBoard(): void {
        this.deckDisplay = new DeckArea(this, SCENE_CONFIG.DECK, this.boardManager);
        this.deckDisplay.initCards(GAME_CONFIG.INITIAL_DECK_SIZE);
        this.deckDisplay.setAutoArrange(true);
        

        this.handDisplay = new HandArea(this, SCENE_CONFIG.HAND, this.boardManager);
        this.discardDisplay = new CardArea(this, SCENE_CONFIG.DISCARD, this.boardManager);
        
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
    
    /**
     * Setup Blind Panel for displaying game progress information
     */
    private setupBlindPanel(): void {
        // Create the blind panel
        this.blindPanel = new BlindPanel(this, SCENE_CONFIG.BLIND_PANEL);
        
        // Update the panel with current blind information
        this.updateBlindInfo();
        
        // Initialize score manager and money
        this.blindPanel.updateMoney(this.scoreManager.getMoney());
        
        // Set initial hands and discards
        this.blindPanel.updateHandsAndDiscards(
            this.runManager.getRemainingHands(),
            this.runManager.getRemainingDiscards()
        );
    }

    /**
     * Update current Blind information
     */
    private updateBlindInfo(): void {
        const currentAnte = this.runManager.getCurrentAnte();
        const currentBlind = this.runManager.getCurrentBlind();
        
        if (!currentAnte || !currentBlind) {
            return;
        }
        
        // Update Blind panel with current blind information
        this.blindPanel.updateBlind(
            currentBlind.config.type,
            currentBlind.config.name,
            Math.floor(currentAnte.config.baseChips * currentBlind.config.baseMultiplier)
        );
        
        // Update Ante and round information
        this.blindPanel.updateAnteAndRound(
            this.runManager.getCurrentAnteIndex() + 1,
            this.runManager.getTotalAntes(),
            this.runManager.getCurrentRound()
        );
        
        // Update score if available
        this.blindPanel.updateScore(this.scoreManager.getRoundScore());
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
     * Handle play hand action
     */
    private async onPlayHand(): Promise<void> {
        // Get selected cards
        const selectedCards = this.handDisplay.getSelectedCards();
        
        // Check if there are selected cards
        if (selectedCards.length === 0) {
            return;
        }

        // Calculate score for the hand
        const scoreResult = this.scoreManager.calculateScore(selectedCards);
        
        // Update the score and money
        this.scoreManager.updateScoreAndMoney(scoreResult.score);
        
        // Update UI
        this.blindPanel.updateScore(scoreResult.score);
        this.blindPanel.updateMoney(this.scoreManager.getMoney());
        
        // Show toast with score result
        Toast.getInstance().info(
            `${scoreResult.combination}: ${scoreResult.description}\nScore: ${scoreResult.score} points!`,
            { position: 'middle', duration: 3000 }
        );
        
        // Check if current blind is completed
        if (this.runManager.isCurrentBlindCompleted(scoreResult.score)) {
            // Show success message
            const currentBlind = this.runManager.getCurrentBlind();
            if (currentBlind) {
                Toast.getInstance().success(`${currentBlind.config.name} cleared!`);
            }
            
            // Move to next blind
            const hasMoreBlinds = this.runManager.advanceToNextBlind();
            
            // Update blind info
            this.updateBlindInfo();
            
            // If no more blinds, show game complete message
            if (!hasMoreBlinds) {
                Toast.getInstance().success("Game complete! You've finished all blinds!");
            }
        }
        
        // Remove played cards from hand
        this.handDisplay.removeSelectedCards();
        
        // Deal new cards to replace the ones played
        const newCards = this.boardManager.discardCards(selectedCards);
        await this.animatePlayCards(selectedCards);
        await wait(200);
        await this.animateDealCards(newCards);
        
        // Update hands count in UI
        this.blindPanel.updateHandsAndDiscards(
            this.runManager.getRemainingHands(),
            this.runManager.getRemainingDiscards()
        );
    }

    /**
     * Handle discard action
     */
    private async onDiscard(): Promise<void> {
        const selectedCards = this.handDisplay.getSelectedCards();
        if (selectedCards.length === 0) {
            return;
        }

        const newCards = this.boardManager.discardCards(selectedCards);

        await this.animateDiscardCards(selectedCards);

        await wait(200);
        await this.animateDealCards(newCards);
        
        // Xóa bài đã chọn sau khi đã xử lý xong
        this.handDisplay.clearSelection();

        // Update discards count in UI
        this.blindPanel.updateHandsAndDiscards(
            this.runManager.getRemainingHands(),
            this.runManager.getRemainingDiscards()
        );
    }

    async animatePlayCards(cards: PlayingCard[]): Promise<void> {
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
}   
