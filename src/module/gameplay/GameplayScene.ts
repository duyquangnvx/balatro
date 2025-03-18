import { Scene } from 'phaser';
import { SceneKeys } from '../../scenes/SceneKeys';
import { BoardController } from '../board/BoardController';
import { GameStateView } from './views/GameStateView';
import { GameState } from './models/GameState';

export class GameplayScene extends Scene
{
    private boardController!: BoardController;
    private gameState!: GameState;
    private gameStateView!: GameStateView;
    
    // UI elements
    private handControllerContainer!: Phaser.GameObjects.Container;
    private playHandButton!: Phaser.GameObjects.Text;
    private discardButton!: Phaser.GameObjects.Text;
    private sortContainer!: Phaser.GameObjects.Container;
    private sortByRankButton!: Phaser.GameObjects.Text;
    private sortBySuitButton!: Phaser.GameObjects.Text;

    // Button colors
    private static readonly BUTTON_ACTIVE_COLOR = 0x555555;
    private static readonly BUTTON_DISABLED_COLOR = 0x333333;
    private static readonly DISCARD_ACTIVE_COLOR = 0x990000;
    private static readonly DISCARD_DISABLED_COLOR = 0x4d0000;

    constructor ()
    {
        super({ key: SceneKeys.GAMEPLAY });
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
    }

    create ()
    {
        // Add background centered in the screen
        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        bg.setOrigin(0.5, 0.5); // Center the image

        // Initialize game state with default values
        this.gameState = new GameState(
            1000,  // Initial money
            300,   // Required score
            3,     // Max discards
            1      // Max plays
        );

        this.boardController = new BoardController(this);
        this.boardController.initBoard();

        this.initPlayerController();

        // Pass game state to GameStateView
        this.gameStateView = new GameStateView(this, 0, 0, this.gameState);

        this.boardController.newGame();
        this.boardController.startGame();

        // Initial button state update
        this.updateButtonStates();
    }
    
    private initPlayerController(): void {
        const centerX = this.cameras.main.width / 2;
        const buttonY = this.cameras.main.height - 40;
        
        // Create a container for all buttons
        this.handControllerContainer = this.add.container(0, 0);
        
        // Create Play Hand button
        this.playHandButton = this.add.text(
            centerX - 250, 
            buttonY, 
            'Play Hand', 
            { 
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: `#${GameplayScene.BUTTON_ACTIVE_COLOR.toString(16)}`,
                padding: { x: 15, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        this.handControllerContainer.add(this.playHandButton);
        
        // Create container for Sort Hand and child buttons
        this.sortContainer = this.add.container(centerX, buttonY);
        this.handControllerContainer.add(this.sortContainer);
        
        // Background for sort container
        const sortBackground = this.add.graphics();
        sortBackground.fillStyle(0x006600, 1);
        sortBackground.fillRoundedRect(-80, -30, 160, 60, 10);
        sortBackground.lineStyle(2, 0xFFFFFF, 1);
        sortBackground.strokeRoundedRect(-80, -30, 160, 60, 10);
        this.sortContainer.add(sortBackground);
        
        // Sort Hand title
        const sortTitle = this.add.text(
            0, 
            -20, 
            'Sort Hand', 
            { 
                fontSize: '16px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        this.sortContainer.add(sortTitle);
        
        // Sort by Rank button
        this.sortByRankButton = this.add.text(
            -40, 
            5, 
            'Rank', 
            {
                fontSize: '14px',
                color: '#000000',
                backgroundColor: '#FFA500', // Orange
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setInteractive();
        this.sortContainer.add(this.sortByRankButton);
        
        // Sort by Suit button
        this.sortBySuitButton = this.add.text(
            40, 
            5, 
            'Suit', 
            {
                fontSize: '14px',
                color: '#000000',
                backgroundColor: '#FFA500', // Orange
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setInteractive();
        this.sortContainer.add(this.sortBySuitButton);
        
        // Discard button
        this.discardButton = this.add.text(
            centerX + 250, 
            buttonY, 
            'Discard', 
            { 
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: `#${GameplayScene.DISCARD_ACTIVE_COLOR.toString(16)}`,
                padding: { x: 15, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        this.handControllerContainer.add(this.discardButton);
        
        // Add event listeners
        this.playHandButton.on('pointerdown', () => {
            if (this.gameState.remainingPlays > 0) {
                console.log('Play Hand clicked - to be implemented');
                if (this.gameState.usePlay()) {
                    this.boardController.playSelectedCards();
                    this.gameStateView.updateDisplay();
                    this.updateButtonStates();
                }
            }
        });
        
        this.sortByRankButton.on('pointerdown', () => this.boardController.sortCardsByRank());
        this.sortBySuitButton.on('pointerdown', () => this.boardController.sortCardsBySuit());
        
        this.discardButton.on('pointerdown', () => {
            if (this.gameState.remainingDiscards > 0) {
                if (this.gameState.useDiscard()) {
                    this.boardController.discardSelectedCards();
                    this.gameStateView.updateDisplay();
                    this.updateButtonStates();
                }
            }
        });
    }

    /**
     * Update button states based on remaining plays and discards
     */
    private updateButtonStates(): void {
        // Update play hand button
        if (this.gameState.remainingPlays > 0) {
            this.playHandButton.setBackgroundColor(`#${GameplayScene.BUTTON_ACTIVE_COLOR.toString(16)}`);
            this.playHandButton.setInteractive();
        } else {
            this.playHandButton.setBackgroundColor(`#${GameplayScene.BUTTON_DISABLED_COLOR.toString(16)}`);
            this.playHandButton.disableInteractive();
        }

        // Update discard button
        if (this.gameState.remainingDiscards > 0) {
            this.discardButton.setBackgroundColor(`#${GameplayScene.DISCARD_ACTIVE_COLOR.toString(16)}`);
            this.discardButton.setInteractive();
        } else {
            this.discardButton.setBackgroundColor(`#${GameplayScene.DISCARD_DISABLED_COLOR.toString(16)}`);
            this.discardButton.disableInteractive();
        }
    }

    destroy(): void {
        this.boardController.destroy();
        if (this.handControllerContainer) {
            this.handControllerContainer.destroy();
        }
    }
}
