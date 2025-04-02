import { Scene } from 'phaser';
import { HandArea, SortType } from '../components/areas/hand-area';
import { Button } from './button';
import { createThemedText } from '../utils/game-utils';
import { applyShadow } from '../utils/effect-utils';
import { THEME_CONFIG } from '../config/theme-config';
export interface ActionPanelConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    onPlayHand?: () => void;
    onDiscard?: () => void;
    onSortByRank?: () => void;
    onSortBySuit?: () => void;
}

export class ActionPanel extends Phaser.GameObjects.Container {
    private playHandButton: Button;
    private discardButton: Button;
    private sortPanel: Phaser.GameObjects.Container;
    private rankButton: Button;
    private suitButton: Button;

    private readonly activePlayHandColor = THEME_CONFIG.COLORS.BALATRO.BLUE;
    private readonly activeDiscardColor = THEME_CONFIG.COLORS.BALATRO.RED;
    private readonly inactiveButtonColor = 0x4C4C4C;
    private readonly buttonTextColor = 0xFFFFFF;
    private readonly buttonWidth = 150;
    private readonly buttonHeight = 100;
    private readonly buttonSpacing = 40;
    private readonly sortButtonWidth = 60;
    private readonly sortButtonHeight = 60;
    private readonly sortButtonSpacing = 20;

    private handArea?: HandArea;

    constructor(scene: Scene, config: ActionPanelConfig) {
        super(scene, config.x, config.y);
        
        const totalWidth = this.buttonWidth * 3 + this.buttonSpacing * 2;
        const startX = -totalWidth / 2 + this.buttonWidth / 2;
        
        // Create Play Hand button
        this.playHandButton = new Button(scene, {
            x: startX,
            y: 0,
            width: this.buttonWidth,
            height: this.buttonHeight,
            text: 'Play Hand',
            backgroundColor: this.inactiveButtonColor,
            textColor: this.buttonTextColor,
            fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM,
            onClick: config.onPlayHand
        });
        this.add(this.playHandButton);

        // Create Discard button
        this.discardButton = new Button(scene, {
            x: startX + (this.buttonWidth + this.buttonSpacing) * 2,
            y: 0,
            width: this.buttonWidth,
            height: this.buttonHeight,
            text: 'Discard',
            backgroundColor: this.inactiveButtonColor,
            textColor: this.buttonTextColor,
            fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM,
            onClick: config.onDiscard
        });
        this.add(this.discardButton);

        applyShadow(this.playHandButton, {
            shadowColor: 0x000000,
            angle: -135,
            distance: 5,
            alpha: 0.5
        });

        applyShadow(this.discardButton, {
            shadowColor: 0x000000,
            angle: -135,
            distance: 5,
            alpha: 0.5
        });
        
        // Create Sort Hand panel
        this.sortPanel = this.createSortPanel(
            startX + this.buttonWidth + this.buttonSpacing,
            0,
            this.buttonWidth,
            this.buttonHeight,
            config.onSortByRank,
            config.onSortBySuit
        );
        this.add(this.sortPanel);
        
        scene.add.existing(this);
    }
    
    private createSortPanel(
        x: number,
        y: number,
        width: number,
        height: number,
        onSortByRank?: () => void,
        onSortBySuit?: () => void
    ): Phaser.GameObjects.Container {
        const container = new Phaser.GameObjects.Container(this.scene, x, y);
        
        // Create panel background with transparent fill and white border
        const bg = this.scene.rexUI.add.roundRectangle(0, 0, width, height, 8, 0x000000);
        bg.setStrokeStyle(2, 0xFFFFFF); // Thêm viền trắng, độ dày 2px
        bg.setFillStyle(0x000000, 0); // Đặt nền trong suốt (alpha = 0)
        container.add(bg);
        
        // Create Sort Hand title
        const title = createThemedText(this.scene, 0, -height/3, 'Sort Hand', {
            fontSize: THEME_CONFIG.FONTS.SIZES.SMALL,
            color: 0xFFFFFF
        });
        title.setOrigin(0.5);
        container.add(title);
        
        // Create Rank button
        this.rankButton = new Button(this.scene, {
            x: -width/4,
            y: height/3 - this.sortButtonSpacing,
            width: this.sortButtonWidth,
            height: this.sortButtonHeight,
            text: 'Rank',
            backgroundColor: THEME_CONFIG.COLORS.BALATRO.YELLOW,
            textColor: this.buttonTextColor,
            fontSize: THEME_CONFIG.FONTS.SIZES.TINY,
            onClick: onSortByRank
        });
        container.add(this.rankButton);
        
        // Create Suit button
        this.suitButton = new Button(this.scene, {
            x: width/4,
            y: height/3 - this.sortButtonSpacing,
            width: this.sortButtonWidth,
            height: this.sortButtonHeight,
            text: 'Suit',
            backgroundColor: THEME_CONFIG.COLORS.BALATRO.YELLOW,
            textColor: this.buttonTextColor,
            fontSize: THEME_CONFIG.FONTS.SIZES.TINY,
            onClick: onSortBySuit
        });
        container.add(this.suitButton);
        
        return container;
    }
    
    public setHandArea(handArea: HandArea): void {
        // If there is a handArea, remove the old listener
        if (this.handArea) {
            this.handArea.off('card-selected-changed', this.updateButtonStates, this);
        }
        
        this.handArea = handArea;
        
        // Register for the card-selected-changed event
        this.handArea.on('card-selected-changed', this.updateButtonStates, this);
        
        // Update initial state
        this.updateButtonStates();
    }
    
    /**
     * Update button states based on whether there are selected cards
     * @param selectedCards List of selected cards, if not provided, get from handArea
     */
    public updateButtonStates(selectedCards?: any[]): void {
        if (!this.handArea) {
            return;
        }
        
        // If no selectedCards are provided, get from handArea
        const hasSelectedCards = selectedCards ? selectedCards.length > 0 
                                             : this.handArea.getSelectedCards().length > 0;
        
        // Update Play Hand button
        this.playHandButton.setBackgroundColor(hasSelectedCards ? this.activePlayHandColor : this.inactiveButtonColor);
        
        // Update Discard button
        this.discardButton.setBackgroundColor(hasSelectedCards ? this.activeDiscardColor : this.inactiveButtonColor);
    }
} 

