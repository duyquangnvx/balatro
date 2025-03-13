import { Scene } from 'phaser';
import { SceneKeys } from './SceneKeys';
import { GameState } from '../managers/GameState';
import { DeckStyle } from '../models/DeckStyle';
import { Enhancement } from '../models/types';
import { Card } from '../models/Card';

export class Game extends Scene
{
    private gameState!: GameState;

    constructor ()
    {
        super({ key: SceneKeys.GAME });
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
        
        // Apply the new enhancement to all selected cards
        selectedCards.forEach((card: Card) => {
            card.setEnhancement(nextEnhancement);
        });
    }

    destroy(): void {
        this.gameState.destroy();
    }
}
