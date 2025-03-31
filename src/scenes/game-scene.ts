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
    },
    BLIND_INFO: {
        x: GAME_CONFIG.SCREEN_WIDTH / 2,
        y: 80,
        width: 600,
        height: 100
    }
}

export class GameScene extends BaseScene {
    private deckDisplay: DeckArea;
    private handDisplay: HandArea;
    private discardDisplay: CardArea;
    private actionPanel: ActionPanel;
    
    // UI elements cho Blind
    private blindInfoContainer: Phaser.GameObjects.Container;
    private blindNameText: Phaser.GameObjects.Text;
    private blindRequiredScoreText: Phaser.GameObjects.Text;
    private blindEffectText: Phaser.GameObjects.Text;
    private anteText: Phaser.GameObjects.Text;

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
        const width = GAME_CONFIG.SCREEN_WIDTH;  
        const height = GAME_CONFIG.SCREEN_HEIGHT;
        this.add.image(width / 2, height / 2, 'background');

        // Khởi tạo Toast
        Toast.init(this);
        
        // Khởi tạo ScoreManager và RunManager cho game mới
        this.scoreManager.startNewGame();
        this.runManager.startNewRun();

        this.setupBoard();
        this.setupBlindInfo();
        this.updateBlindInfo();

        this.newGame();
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
     * Create UI to display current Blind information
     */
    private setupBlindInfo(): void {
        // Create container
        this.blindInfoContainer = this.add.container(
            SCENE_CONFIG.BLIND_INFO.x,
            SCENE_CONFIG.BLIND_INFO.y
        );
        
        // Background
        const bg = this.add.rectangle(
            0, 0,
            SCENE_CONFIG.BLIND_INFO.width,
            SCENE_CONFIG.BLIND_INFO.height,
            0x000000, 0.7
        );
        bg.setOrigin(0.5);
        this.blindInfoContainer.add(bg);
        
        // Text hiển thị tên Ante
        this.anteText = this.add.text(
            -SCENE_CONFIG.BLIND_INFO.width / 2 + 10,
            -SCENE_CONFIG.BLIND_INFO.height / 2 + 10,
            "Ante: ", 
            { 
                font: '16px Arial', 
                color: '#ffffff',
                align: 'left'
            }
        );
        this.blindInfoContainer.add(this.anteText);
        
        // Text to display Blind name
        this.blindNameText = this.add.text(
            0,
            -20,
            "Blind Name", 
            { 
                font: '20px Arial', 
                color: '#ffffff',
                align: 'center'
            }
        );
        this.blindNameText.setOrigin(0.5, 0.5);
        this.blindInfoContainer.add(this.blindNameText);
        
        // Text to display required score
        this.blindRequiredScoreText = this.add.text(
            0,
            10,
            "Required Score: 0", 
            { 
                font: '18px Arial', 
                color: '#ffff00',
                align: 'center'
            }
        );
        this.blindRequiredScoreText.setOrigin(0.5, 0.5);
        this.blindInfoContainer.add(this.blindRequiredScoreText);
        
        // Text to display special effect (if any)
        this.blindEffectText = this.add.text(
            0,
            35,
            "", 
            { 
                font: '16px Arial', 
                color: '#ff8888',
                align: 'center'
            }
        );
        this.blindEffectText.setOrigin(0.5, 0.5);
        this.blindInfoContainer.add(this.blindEffectText);
    }
    
    /**
     * Update current Blind information
     */
    private updateBlindInfo(): void {
        const currentAnte = this.runManager.getCurrentAnte();
        const currentBlind = this.runManager.getCurrentBlind();
        
        if (!currentAnte || !currentBlind) {
            this.blindInfoContainer.setVisible(false);
            return;
        }
        
        this.blindInfoContainer.setVisible(true);
        
        // Update Ante name
        this.anteText.setText(`Ante: ${currentAnte.config.name}`);
        
        // Update Blind name
        this.blindNameText.setText(currentBlind.config.name);
        
        // Update required score
        this.blindRequiredScoreText.setText(`Required Score: ${currentBlind.requiredScore}`);
        
        // Update special effect (if any)
        if (currentBlind.config.effect) {
            this.blindEffectText.setText(currentBlind.config.effect);
            this.blindEffectText.setVisible(true);
        } else {
            this.blindEffectText.setVisible(false);
        }
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
    private async onPlayHand(): Promise<void> {
        const selectedCards = this.handDisplay.getSelectedCards();
        if (selectedCards.length === 0) {
            return;
        }

        // Tính điểm dựa trên bài được chơi
        const scoreResult = this.scoreManager.calculateScore(selectedCards);
        
        // Hiển thị kết quả tính điểm
        Toast.getInstance().info(
            `${scoreResult.description}\nĐiểm: ${scoreResult.score} x ${scoreResult.multiplier} = ${scoreResult.totalScore}`,
            { position: 'middle', duration: 3000 }
        );
        
        // Cập nhật điểm số
        this.scoreManager.updateRoundScore(scoreResult.totalScore);
        
        // Kiểm tra xem điểm có đủ để vượt qua Blind hiện tại không
        const blindCompleted = this.runManager.checkBlindCompleted(scoreResult.totalScore);
        if (blindCompleted) {
            // Hiển thị thông báo vượt qua Blind
            Toast.getInstance().success(
                `Vượt qua ${this.runManager.getCurrentBlind()?.config.name} thành công!`,
                { position: 'top', duration: 2000 }
            );
            
            // Chuyển đến Blind tiếp theo
            const hasMoreBlinds = this.runManager.advanceToNextBlind();
            
            if (!hasMoreBlinds) {
                // Kết thúc run
                Toast.getInstance().success(
                    "Chúc mừng! Bạn đã hoàn thành run!",
                    { position: 'middle', duration: 3000 }
                );
                // TODO: Hiển thị màn hình kết thúc
            } else {
                // Cập nhật thông tin Blind mới
                this.updateBlindInfo();
            }
        }
        
        // Tiếp tục với logic hiện tại
        const newCards = this.boardManager.discardCards(selectedCards);
        await this.animatePlayCards(selectedCards);
        await wait(200);
        await this.animateDealCards(newCards);
        
        // Xóa bài đã chọn sau khi đã xử lý xong
        this.handDisplay.clearSelection();
    }

    /**
     * Handler for Discard button
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
