import { Scene } from 'phaser';
import { HandArea, SortType } from '../components/areas/hand-area';

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
    private playHandButton: Phaser.GameObjects.Container;
    private discardButton: Phaser.GameObjects.Container;
    private sortPanel: Phaser.GameObjects.Container;
    private rankButton: Phaser.GameObjects.Container;
    private suitButton: Phaser.GameObjects.Container;

    private readonly activePlayHandColor = 0x0096FF;
    private readonly activeDiscardColor = 0xFF4440;
    private readonly inactiveButtonColor = 0x4C5554;
    private readonly buttonTextColor = '#FFFFFF';
    private readonly buttonWidth = 150;
    private readonly buttonHeight = 60;
    private readonly buttonSpacing = 40;
    private readonly sortButtonWidth = 70;
    private readonly sortButtonHeight = 40;

    private handArea?: HandArea;

    constructor(scene: Scene, config: ActionPanelConfig) {
        super(scene, config.x, config.y);
        
        const totalWidth = this.buttonWidth * 3 + this.buttonSpacing * 2;
        const startX = -totalWidth / 2 + this.buttonWidth / 2;
        
        // Create Play Hand button
        this.playHandButton = this.createButton(
            startX,
            0,
            this.buttonWidth,
            this.buttonHeight,
            'Play Hand',
            this.inactiveButtonColor,
            config.onPlayHand
        );
        this.add(this.playHandButton);
        
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
        
        // Create Discard button
        this.discardButton = this.createButton(
            startX + (this.buttonWidth + this.buttonSpacing) * 2,
            0,
            this.buttonWidth,
            this.buttonHeight,
            'Discard',
            this.inactiveButtonColor,
            config.onDiscard
        );
        this.add(this.discardButton);
        
        scene.add.existing(this);
    }
    
    private createButton(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        color: number,
        callback?: () => void
    ): Phaser.GameObjects.Container {
        const container = new Phaser.GameObjects.Container(this.scene, x, y);
        
        // Create button background
        const bg = this.scene.add.rectangle(0, 0, width, height, color);
        bg.setOrigin(0.5);
        container.add(bg);
        
        // Create button text
        const buttonText = this.scene.add.text(0, 0, text, {
            fontSize: '20px',
            color: this.buttonTextColor
        });
        buttonText.setOrigin(0.5);
        container.add(buttonText);
        
        // Make button interactive
        bg.setInteractive({ useHandCursor: true });
        if (callback) {
            bg.on('pointerdown', callback);
        }
        
        return container;
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
        
        // Create panel background
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x333333);
        bg.setOrigin(0.5);
        container.add(bg);
        
        // Create Sort Hand title
        const title = this.scene.add.text(0, -height/4, 'Sort Hand', {
            fontSize: '16px',
            color: this.buttonTextColor
        });
        title.setOrigin(0.5);
        container.add(title);
        
        // Create Rank button
        this.rankButton = this.createButton(
            -width/4,
            height/4,
            this.sortButtonWidth,
            this.sortButtonHeight,
            'Rank',
            0xFFA500,
            onSortByRank
        );
        container.add(this.rankButton);
        
        // Create Suit button
        this.suitButton = this.createButton(
            width/4,
            height/4,
            this.sortButtonWidth,
            this.sortButtonHeight,
            'Suit',
            0xFFA500,
            onSortBySuit
        );
        container.add(this.suitButton);
        
        return container;
    }
    
    public setHandArea(handArea: HandArea): void {
        // Nếu đã có handArea trước đó, xóa listener cũ
        if (this.handArea) {
            this.handArea.off('card-selected-changed', this.updateButtonStates, this);
        }
        
        this.handArea = handArea;
        
        // Đăng ký lắng nghe sự kiện card-selected-changed
        this.handArea.on('card-selected-changed', this.updateButtonStates, this);
        
        // Cập nhật trạng thái ban đầu
        this.updateButtonStates();
    }
    
    /**
     * Cập nhật trạng thái nút dựa trên việc có card được chọn hay không
     * @param selectedCards Danh sách card đã chọn, nếu không truyền vào sẽ lấy từ handArea
     */
    public updateButtonStates(selectedCards?: any[]): void {
        if (!this.handArea) {
            return;
        }
        
        // Nếu không có selectedCards được truyền vào, lấy từ handArea
        const hasSelectedCards = selectedCards ? selectedCards.length > 0 
                                             : this.handArea.getSelectedCards().length > 0;
        
        // Update Play Hand button
        const playHandButton = this.playHandButton.getAt(0) as Phaser.GameObjects.Rectangle;
        playHandButton.fillColor = hasSelectedCards ? this.activePlayHandColor : this.inactiveButtonColor;
        
        // Update Discard button
        const discardButton = this.discardButton.getAt(0) as Phaser.GameObjects.Rectangle;
        discardButton.fillColor = hasSelectedCards ? this.activeDiscardColor : this.inactiveButtonColor;
    }
} 