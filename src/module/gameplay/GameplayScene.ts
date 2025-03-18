import { Scene } from 'phaser';
import { SceneKeys } from '../../scenes/SceneKeys';
import { BoardController } from './BoardController';

export class GameplayScene extends Scene
{
    private boardController!: BoardController;
    
    // UI elements
    private handControllerContainer!: Phaser.GameObjects.Container;
    private playHandButton!: Phaser.GameObjects.Text;
    private discardButton!: Phaser.GameObjects.Text;
    private sortContainer!: Phaser.GameObjects.Container;
    private sortByRankButton!: Phaser.GameObjects.Text;
    private sortBySuitButton!: Phaser.GameObjects.Text;

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

        this.boardController = new BoardController(this);
        this.boardController.initBoard();

        this.initPlayerController();

        this.boardController.newGame();
        this.boardController.startGame();
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
                backgroundColor: '#555555',
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
                backgroundColor: '#990000',
                padding: { x: 15, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        this.handControllerContainer.add(this.discardButton);
        
        // Add event listeners
        this.playHandButton.on('pointerdown', () => {
            console.log('Play Hand clicked - to be implemented');
        });
        
        this.sortByRankButton.on('pointerdown', () => this.boardController.sortCardsByRank());
        this.sortBySuitButton.on('pointerdown', () => this.boardController.sortCardsBySuit());
        this.discardButton.on('pointerdown', () => this.boardController.discardSelectedCards());
    }


    destroy(): void {
        this.boardController.destroy();
        if (this.handControllerContainer) {
            this.handControllerContainer.destroy();
        }
    }
}
