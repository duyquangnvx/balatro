import { Scene } from 'phaser';
import { SceneKeys } from './SceneKeys';
import { GameState } from '../managers/GameState';
import { DeckStyle, Enhancement, CardModel } from '../module/gameplay';
import EventBus from '../base/EventBus';
import { GameEvents } from '../data/GameEvents';

export class Game extends Scene
{
    private gameState!: GameState;
    private eventBus: EventBus;

    constructor ()
    {
        super({ key: SceneKeys.GAME });
        this.eventBus = EventBus.getInstance();
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

        // Initialize game state
        this.gameState = new GameState(this);
        
        // Add deck style button (simple version without DeckStyleManager)
        const styleButton = this.add.text(
            20, 
            20, 
            'Change Card Back', 
            { 
                fontSize: '18px', 
                color: '#ffffff',
                backgroundColor: '#0066cc',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();
        
        // Simple cycling through styles on click
        styleButton.on('pointerdown', () => {
            this.cycleDeckStyle();
        });

        // Add enhancement button
        const enhancementButton = this.add.text(
            20, 
            60, 
            'Change Enhancement', 
            { 
                fontSize: '18px', 
                color: '#ffffff',
                backgroundColor: '#cc6600',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();
        
        // Cycle through enhancements on click
        enhancementButton.on('pointerdown', () => {
            this.cycleEnhancement();
        });
        
        // Add draw card button
        const drawButton = this.add.text(
            20, 
            100, 
            'Draw Card', 
            { 
                fontSize: '18px', 
                color: '#ffffff',
                backgroundColor: '#009900',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();
        
        // Draw a card on click
        drawButton.on('pointerdown', () => {
            this.eventBus.emit(GameEvents.UI_BUTTON_CLICKED, 'drawCard');
        });
        
        // Add debug button
        const debugButton = this.add.text(
            20, 
            140, 
            'Debug EventBus', 
            { 
                fontSize: '18px', 
                color: '#ffffff',
                backgroundColor: '#990099',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();
        
        // Debug EventBus on click
        debugButton.on('pointerdown', () => {
            this.debugEventBus();
        });

        // Add debug button for HandView
        const handDebugButton = this.add.text(
            20, 
            180, 
            'Debug Hand', 
            { 
                fontSize: '18px', 
                color: '#ffffff',
                backgroundColor: '#660066',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();
        
        // Debug HandView on click
        handDebugButton.on('pointerdown', () => {
            this.debugHandView();
        });
    }
    
    /**
     * Debug EventBus listener counts
     */
    private debugEventBus(): void {
        this.eventBus.debugAllListeners();
    }

    /**
     * Cycle through available deck styles
     */
    private cycleDeckStyle(): void {
        const styles = Object.values(DeckStyle);
        const currentStyle = this.gameState.getDeckStyle();
        const currentIndex = styles.indexOf(currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        
        this.gameState.setDeckStyle(styles[nextIndex]);
    }

    /**
     * Cycle through available enhancements for selected cards
     */
    private cycleEnhancement(): void {
        const enhancements = Object.values(Enhancement);
        const selectedCards = this.gameState.getSelectedCards();
        
        if (selectedCards.length === 0) {
            console.log('No cards selected. Please select a card first.');
            return;
        }
        
        // Get the enhancement of the first selected card
        const currentEnhancement = selectedCards[0].getEnhancement();
        const currentIndex = enhancements.indexOf(currentEnhancement);
        const nextIndex = (currentIndex + 1) % enhancements.length;
        const nextEnhancement = enhancements[nextIndex];
        
        // Apply the new enhancement to all selected cards using GameController
        this.gameState.getGameController().setEnhancementForSelectedCards(nextEnhancement);
    }

    /**
     * Debug HandView
     */
    private debugHandView(): void {
        this.gameState.getGameController().getHandController().getView().debugCardViews();
    }

    destroy(): void {
        this.gameState.destroy();
    }
}
