
import { GameObjects, Scene } from 'phaser';
import { GameState } from '../models/GameState';    

/**
 * GameStateView - UI component for displaying game statistics on the left panel
 * Displays blind info, score requirements, round score, hand count, discard count, etc.
 */
export class GameStateView extends GameObjects.Container {
    // Main panels and containers
    private mainPanel: GameObjects.Container;
    private blindPanel: GameObjects.Container;
    private roundScorePanel: GameObjects.Container;
    private scoreMultiplierPanel: GameObjects.Container;
    private handDiscardPanel: GameObjects.Container;
    private anteRoundPanel: GameObjects.Container;
    private infoButtonsPanel: GameObjects.Container;

    // Game state
    private gameState: GameState;

    // UI Elements
    private blindTitle: GameObjects.Text;
    private blindIcon: GameObjects.Sprite;
    private blindScoreRequired: GameObjects.Text;
    private blindReward: GameObjects.Text;
    private roundScoreText: GameObjects.Text;
    private roundScoreValue: GameObjects.Text;
    private scoreValueText: GameObjects.Text;
    private multiplierValueText: GameObjects.Text;
    private handCountText: GameObjects.Text;
    private discardCountText: GameObjects.Text;
    private moneyText: GameObjects.Text;
    private anteText: GameObjects.Text;
    private roundText: GameObjects.Text;
    private runInfoButton: GameObjects.Container;
    private optionsButton: GameObjects.Container;

    // Game state values
    private currentBlindTitle: string = 'Small Blind';
    private currentScoreRequired: number = 300;
    private currentRoundScore: number = 0;
    private currentChips: number = 4;
    private currentMultiplier: number = 0;
    private handCount: number = 4;
    private discardCount: number = 4;
    private moneyAmount: number = 54;
    private anteValue: number = 1;
    private maxAnteValue: number = 8;
    private currentRound: number = 1;

    // UI Constants
    private static readonly PANEL_WIDTH = 320;
    private static readonly BACKGROUND_COLOR = 0x1a3b5c;
    private static readonly DARKER_BACKGROUND_COLOR = 0x0f2233;
    private static readonly TEXT_COLOR = 0xFFFFFF;
    private static readonly TITLE_COLOR = 0xFFFFFF;
    private static readonly VALUE_COLOR = 0xFFFFFF;
    private static readonly CHIPS_COLOR = 0x00AAFF;
    private static readonly MULTIPLIER_COLOR = 0xFF4444;
    private static readonly MONEY_COLOR = 0xFFCC44;
    private static readonly BLIND_SCORE_COLOR = 0xFF4444;
    private static readonly RUN_INFO_COLOR = 0xFF4444;
    private static readonly OPTIONS_COLOR = 0xFFAA22;
    private static readonly FONT_FAMILY = 'Arial';

    constructor(scene: Scene, x: number, y: number, gameState: GameState) {
        super(scene, x, y);
        scene.add.existing(this);

        this.gameState = gameState;

        this.mainPanel = this.createMainPanel();
        this.add(this.mainPanel);

        this.blindPanel = this.createBlindPanel();
        this.mainPanel.add(this.blindPanel);

        this.roundScorePanel = this.createRoundScorePanel();
        this.mainPanel.add(this.roundScorePanel);

        this.scoreMultiplierPanel = this.createScoreMultiplierPanel();
        this.mainPanel.add(this.scoreMultiplierPanel);

        this.handDiscardPanel = this.createHandDiscardPanel();
        this.mainPanel.add(this.handDiscardPanel);

        this.anteRoundPanel = this.createAnteRoundPanel();
        this.mainPanel.add(this.anteRoundPanel);

        this.infoButtonsPanel = this.createInfoButtonsPanel();
        this.mainPanel.add(this.infoButtonsPanel);

        this.updateDisplay();
    }

    /**
     * Create the main background panel
     */
    private createMainPanel(): GameObjects.Container {
        const panel = new GameObjects.Container(this.scene, 0, 0);
        
        // Main background with border
        const bg = this.scene.add.rectangle(0, 0, GameStateView.PANEL_WIDTH, 720, GameStateView.BACKGROUND_COLOR);
        bg.setOrigin(0, 0);
        bg.setStrokeStyle(2, 0x00AAFF);
        
        panel.add(bg);
        return panel;
    }

    /**
     * Create the blind information panel
     */
    private createBlindPanel(): GameObjects.Container {
        const panel = new GameObjects.Container(this.scene, 0, 0);
        
        // Blind title background
        const titleBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH / 2, 
            40, 
            GameStateView.PANEL_WIDTH - 40, 
            60, 
            0x0066AA
        );
        titleBg.setOrigin(0.5, 0.5);
        titleBg.setStrokeStyle(2, 0x00AAFF);
        panel.add(titleBg);
        
        // Blind title text
        this.blindTitle = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 2, 
            40, 
            this.currentBlindTitle, 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        this.blindTitle.setOrigin(0.5, 0.5);
        panel.add(this.blindTitle);
        
        // Blind info background
        const infoBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH / 2, 
            120, 
            GameStateView.PANEL_WIDTH - 40, 
            100, 
            GameStateView.DARKER_BACKGROUND_COLOR
        );
        infoBg.setOrigin(0.5, 0.5);
        panel.add(infoBg);
        
        // Blind icon
        this.blindIcon = this.scene.add.sprite(
            120, 
            115, 
            'small_blind_icon'
        );
        this.blindIcon.setScale(0.8);
        panel.add(this.blindIcon);
        
        // Score requirement text
        const scoreLabel = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 2 + 20, 
            100, 
            'Score at least', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '14px',
                color: '#FFFFFF'
            }
        );
        scoreLabel.setOrigin(0.5, 0.5);
        panel.add(scoreLabel);
        
        // Required score value
        this.blindScoreRequired = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 2 + 20, 
            125, 
            `${this.currentScoreRequired}`, 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '32px',
                fontStyle: 'bold',
                color: `#${GameStateView.BLIND_SCORE_COLOR.toString(16)}`
            }
        );
        this.blindScoreRequired.setOrigin(0.5, 0.5);
        panel.add(this.blindScoreRequired);
        
        // Reward text
        const rewardLabel = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 2, 
            150, 
            'Reward:', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '14px',
                color: '#FFFFFF'
            }
        );
        rewardLabel.setOrigin(0.5, 0.5);
        panel.add(rewardLabel);
        
        // Reward value
        this.blindReward = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 2, 
            170, 
            '$$$', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '20px',
                fontStyle: 'bold',
                color: `#${GameStateView.MONEY_COLOR.toString(16)}`
            }
        );
        this.blindReward.setOrigin(0.5, 0.5);
        panel.add(this.blindReward);
        
        return panel;
    }

    /**
     * Create the round score panel
     */
    private createRoundScorePanel(): GameObjects.Container {
        const panel = new GameObjects.Container(this.scene, 0, 210);
        
        // Background
        const bg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH / 2, 
            30, 
            GameStateView.PANEL_WIDTH - 40, 
            60, 
            GameStateView.DARKER_BACKGROUND_COLOR
        );
        bg.setOrigin(0.5, 0.5);
        panel.add(bg);
        
        // Round score text
        this.roundScoreText = this.scene.add.text(
            80, 
            30, 
            'Round\nscore', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '16px',
                align: 'center',
                color: '#FFFFFF'
            }
        );
        this.roundScoreText.setOrigin(0.5, 0.5);
        panel.add(this.roundScoreText);
        
        // Round score value
        this.roundScoreValue = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 2 + 40, 
            30, 
            '0', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '36px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        this.roundScoreValue.setOrigin(0.5, 0.5);
        panel.add(this.roundScoreValue);
        
        return panel;
    }

    /**
     * Create the score and multiplier panel
     */
    private createScoreMultiplierPanel(): GameObjects.Container {
        const panel = new GameObjects.Container(this.scene, 0, 280);
        
        // Background
        const bg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH / 2, 
            30, 
            GameStateView.PANEL_WIDTH - 40, 
            60, 
            0x222222
        );
        bg.setOrigin(0.5, 0.5);
        panel.add(bg);
        
        // Left side (chips)
        const leftBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH / 4, 
            30, 
            GameStateView.PANEL_WIDTH / 2 - 20, 
            60, 
            GameStateView.CHIPS_COLOR
        );
        leftBg.setOrigin(0.5, 0.5);
        panel.add(leftBg);
        
        // Right side (multiplier)
        const rightBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            30, 
            GameStateView.PANEL_WIDTH / 2 - 20, 
            60, 
            GameStateView.MULTIPLIER_COLOR
        );
        rightBg.setOrigin(0.5, 0.5);
        panel.add(rightBg);
        
        // Chips value text
        this.scoreValueText = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 4, 
            30, 
            '0', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        this.scoreValueText.setOrigin(0.5, 0.5);
        panel.add(this.scoreValueText);
        
        // Multiplier text
        this.multiplierValueText = this.scene.add.text(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            30, 
            'x0', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        this.multiplierValueText.setOrigin(0.5, 0.5);
        panel.add(this.multiplierValueText);
        
        return panel;
    }

    /**
     * Create hand and discard count panel
     */
    private createHandDiscardPanel(): GameObjects.Container {
        const panel = new GameObjects.Container(this.scene, 0, 380);
        
        // Hand count container
        const handContainer = new GameObjects.Container(this.scene, 0, 0);
        panel.add(handContainer);
        
        // Hand label
        const handLabel = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 4, 
            0, 
            'Hands', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '16px',
                color: '#FFFFFF'
            }
        );
        handLabel.setOrigin(0.5, 0.5);
        handContainer.add(handLabel);
        
        // Hand count background
        const handBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH / 4, 
            30, 
            80, 
            60, 
            GameStateView.DARKER_BACKGROUND_COLOR
        );
        handBg.setOrigin(0.5, 0.5);
        handContainer.add(handBg);
        
        // Hand count value
        this.handCountText = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 4, 
            30, 
            '4', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '40px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        this.handCountText.setOrigin(0.5, 0.5);
        handContainer.add(this.handCountText);
        
        // Discard count container
        const discardContainer = new GameObjects.Container(this.scene, 0, 0);
        panel.add(discardContainer);
        
        // Discard label
        const discardLabel = this.scene.add.text(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            0, 
            'Discards', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '16px',
                color: '#FFFFFF'
            }
        );
        discardLabel.setOrigin(0.5, 0.5);
        discardContainer.add(discardLabel);
        
        // Discard count background
        const discardBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            30, 
            80, 
            60, 
            GameStateView.DARKER_BACKGROUND_COLOR
        );
        discardBg.setOrigin(0.5, 0.5);
        discardContainer.add(discardBg);
        
        // Discard count value
        this.discardCountText = this.scene.add.text(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            30, 
            '4', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '40px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        this.discardCountText.setOrigin(0.5, 0.5);
        discardContainer.add(this.discardCountText);
        
        // Money amount container
        const moneyContainer = new GameObjects.Container(this.scene, 0, 80);
        panel.add(moneyContainer);
        
        // Money background
        const moneyBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH / 2, 
            0, 
            GameStateView.PANEL_WIDTH - 40, 
            60, 
            GameStateView.DARKER_BACKGROUND_COLOR
        );
        moneyBg.setOrigin(0.5, 0.5);
        moneyContainer.add(moneyBg);
        
        // Money value
        this.moneyText = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 2, 
            0, 
            '$54', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '36px',
                fontStyle: 'bold',
                color: `#${GameStateView.MONEY_COLOR.toString(16)}`
            }
        );
        this.moneyText.setOrigin(0.5, 0.5);
        moneyContainer.add(this.moneyText);
        
        return panel;
    }

    /**
     * Create ante and round panel
     */
    private createAnteRoundPanel(): GameObjects.Container {
        const panel = new GameObjects.Container(this.scene, 0, 520);
        
        // Ante container
        const anteContainer = new GameObjects.Container(this.scene, 0, 0);
        panel.add(anteContainer);
        
        // Ante label
        const anteLabel = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 4, 
            0, 
            'Ante', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '16px',
                color: '#FFFFFF'
            }
        );
        anteLabel.setOrigin(0.5, 0.5);
        anteContainer.add(anteLabel);
        
        // Ante background
        const anteBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH / 4, 
            30, 
            80, 
            50, 
            GameStateView.DARKER_BACKGROUND_COLOR
        );
        anteBg.setOrigin(0.5, 0.5);
        anteContainer.add(anteBg);
        
        // Ante value
        this.anteText = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 4, 
            30, 
            '1/8', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        this.anteText.setOrigin(0.5, 0.5);
        anteContainer.add(this.anteText);
        
        // Round container
        const roundContainer = new GameObjects.Container(this.scene, 0, 0);
        panel.add(roundContainer);
        
        // Round label
        const roundLabel = this.scene.add.text(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            0, 
            'Round', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '16px',
                color: '#FFFFFF'
            }
        );
        roundLabel.setOrigin(0.5, 0.5);
        roundContainer.add(roundLabel);
        
        // Round background
        const roundBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            30, 
            80, 
            50, 
            GameStateView.DARKER_BACKGROUND_COLOR
        );
        roundBg.setOrigin(0.5, 0.5);
        roundContainer.add(roundBg);
        
        // Round value
        this.roundText = this.scene.add.text(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            30, 
            '1', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        this.roundText.setOrigin(0.5, 0.5);
        roundContainer.add(this.roundText);
        
        return panel;
    }

    /**
     * Create info buttons panel
     */
    private createInfoButtonsPanel(): GameObjects.Container {
        const panel = new GameObjects.Container(this.scene, 0, 600);
        
        // Run info button
        this.runInfoButton = new GameObjects.Container(this.scene, 0, 0);
        panel.add(this.runInfoButton);
        
        const runInfoBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH / 4, 
            30, 
            120, 
            60, 
            GameStateView.RUN_INFO_COLOR
        );
        runInfoBg.setOrigin(0.5, 0.5);
        runInfoBg.setInteractive({ useHandCursor: true });
        runInfoBg.on('pointerdown', this.onRunInfoClick, this);
        this.runInfoButton.add(runInfoBg);
        
        const runInfoText = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 4, 
            20, 
            'Run', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        runInfoText.setOrigin(0.5, 0.5);
        this.runInfoButton.add(runInfoText);
        
        const runInfoSubText = this.scene.add.text(
            GameStateView.PANEL_WIDTH / 4, 
            40, 
            'Info', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '16px',
                color: '#FFFFFF'
            }
        );
        runInfoSubText.setOrigin(0.5, 0.5);
        this.runInfoButton.add(runInfoSubText);
        
        // Options button
        this.optionsButton = new GameObjects.Container(this.scene, 0, 0);
        panel.add(this.optionsButton);
        
        const optionsBg = this.scene.add.rectangle(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            30, 
            120, 
            60, 
            GameStateView.OPTIONS_COLOR
        );
        optionsBg.setOrigin(0.5, 0.5);
        optionsBg.setInteractive({ useHandCursor: true });
        optionsBg.on('pointerdown', this.onOptionsClick, this);
        this.optionsButton.add(optionsBg);
        
        const optionsText = this.scene.add.text(
            GameStateView.PANEL_WIDTH * 3 / 4, 
            30, 
            'Options', 
            {
                fontFamily: GameStateView.FONT_FAMILY,
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }
        );
        optionsText.setOrigin(0.5, 0.5);
        this.optionsButton.add(optionsText);
        
        return panel;
    }

    /**
     * Update displayed values with current game state
     */
    public updateDisplay(): void {
        // Update score and required score
        this.currentScoreRequired = this.gameState.requiredScore;
        this.currentRoundScore = this.gameState.currentScore;
        
        // Update money
        this.moneyAmount = this.gameState.money;
        
        // Update remaining plays and discards
        this.handCount = this.gameState.remainingPlays;
        this.discardCount = this.gameState.remainingDiscards;

        // Update UI elements
        this.blindScoreRequired.setText(`${this.currentScoreRequired}`);
        this.roundScoreValue.setText(`${this.currentRoundScore}`);
        this.scoreValueText.setText(`${this.currentChips}`);
        this.multiplierValueText.setText(`x${this.currentMultiplier}`);
        this.handCountText.setText(`${this.handCount}`);
        this.discardCountText.setText(`${this.discardCount}`);
        this.moneyText.setText(`$${this.moneyAmount}`);
        this.anteText.setText(`${this.anteValue}/${this.maxAnteValue}`);
        this.roundText.setText(`${this.currentRound}`);
    }

    /**
     * Update the game state reference and refresh display
     */
    public setGameState(gameState: GameState): void {
        this.gameState = gameState;
        this.updateDisplay();
    }

    /**
     * Run info button click handler
     */
    private onRunInfoClick(): void {
        console.log('Run Info clicked');
        // Dispatch event or call callback
    }

    /**
     * Options button click handler
     */
    private onOptionsClick(): void {
        console.log('Options clicked');
        // Dispatch event or call callback
    }
} 