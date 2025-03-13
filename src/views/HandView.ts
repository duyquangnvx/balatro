import { Scene, GameObjects } from 'phaser';
import { HandModel, SortType } from '../models/HandModel';
import { CardView } from './CardView';
import { CardModel } from '../models/CardModel';
import EventBus from '../base/EventBus';
import { GameEvents } from '../data/GameEvents';

export class HandView {
    private scene: Scene;
    private model: HandModel;
    private cardViews: Map<CardModel, CardView> = new Map();
    private readonly CARD_SPACING = 80;
    private readonly BOTTOM_MARGIN = 200;
    private readonly SELECTED_OFFSET = 20;
    private eventBus: EventBus;
    
    // UI elements
    private playHandButton: GameObjects.Text;
    private discardButton: GameObjects.Text;
    private sortContainer: GameObjects.Container;
    private sortByRankButton: GameObjects.Text;
    private sortBySuitButton: GameObjects.Text;
    private handCountText: GameObjects.Text;

    constructor(scene: Scene, model: HandModel) {
        this.scene = scene;
        this.model = model;
        this.eventBus = EventBus.getInstance();
        
        // Create UI elements
        this.createButtons();
        
        // Subscribe to model events
        this.setupModelListeners();
        
        // Create initial hand count text
        this.createHandCountText();
    }
    
    private setupModelListeners(): void {
        // Listen for hand events
        this.eventBus.on(GameEvents.HAND_UPDATED, () => {
            this.arrangeCards();
            this.updateHandCountText();
        });
        
        this.eventBus.on(GameEvents.HAND_SORTED, () => {
            this.arrangeCards();
        });
    }
    
    private createHandCountText(): void {
        const baseY = this.scene.cameras.main.height - this.BOTTOM_MARGIN;
        
        this.handCountText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            baseY + 50,
            this.model.getCardCount(),
            {
                fontSize: '18px',
                color: '#ffffff'
            }
        ).setOrigin(0.5).setName('handCountText');
    }
    
    private updateHandCountText(): void {
        this.handCountText.setText(this.model.getCardCount());
    }
    
    private createButtons(): void {
        const centerX = this.scene.cameras.main.width / 2;
        const buttonY = this.scene.cameras.main.height - 50;
        
        // Tạo nút Play Hand (sẽ implement sau)
        this.playHandButton = this.scene.add.text(
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
        
        // Tạo container cho Sort Hand và các nút con
        this.sortContainer = this.scene.add.container(centerX, buttonY);
        
        // Background cho sort container
        const sortBackground = this.scene.add.graphics();
        sortBackground.fillStyle(0x006600, 1);
        sortBackground.fillRoundedRect(-80, -30, 160, 60, 10);
        sortBackground.lineStyle(2, 0xFFFFFF, 1);
        sortBackground.strokeRoundedRect(-80, -30, 160, 60, 10);
        this.sortContainer.add(sortBackground);
        
        // Tiêu đề Sort Hand
        const sortTitle = this.scene.add.text(
            0, 
            -20, 
            'Sort Hand', 
            { 
                fontSize: '16px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        this.sortContainer.add(sortTitle);
        
        // Nút Sort by Rank
        this.sortByRankButton = this.scene.add.text(
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
        
        // Nút Sort by Suit
        this.sortBySuitButton = this.scene.add.text(
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
        
        // Nút Discard
        this.discardButton = this.scene.add.text(
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
        
        // Thêm event listeners
        this.playHandButton.on('pointerdown', () => {
            console.log('Play Hand clicked - to be implemented');
        });
        
        this.sortByRankButton.on('pointerdown', () => this.model.sortByRank());
        this.sortBySuitButton.on('pointerdown', () => this.model.sortBySuit());
        this.discardButton.on('pointerdown', () => this.discardSelectedCards());
    }
    
    /**
     * Discard selected cards
     */
    private discardSelectedCards(): void {
        const selectedCards = this.model.getSelectedCards();
        if (selectedCards.length === 0) return;
        
        // Emit event for controller to handle
        this.eventBus.emit(GameEvents.UI_BUTTON_CLICKED, 'discardAndDraw');
    }
    
    /**
     * Add a card view to the hand
     */
    public addCardView(card: CardModel, cardView: CardView): void {
        // Store the card view
        this.cardViews.set(card, cardView);
        
        // Make sure card is face up
        card.flip(true);
        
        // Make sure card is selectable
        card.setSelectable(true);
        
        // Arrange cards
        this.arrangeCards();
    }
    
    /**
     * Arrange cards in the hand
     */
    private arrangeCards(): void {
        const cards = this.model.getCards();
        
        // Remove card views that are no longer in the model
        const cardViewsToRemove: [CardModel, CardView][] = [];
        this.cardViews.forEach((cardView, card) => {
            if (!cards.includes(card)) {
                cardViewsToRemove.push([card, cardView]);
            }
        });
        
        // Destroy and remove card views
        cardViewsToRemove.forEach(([card, cardView]) => {
            cardView.destroy();
            this.cardViews.delete(card);
        });
        
        // Arrange remaining cards
        const totalWidth = (cards.length - 1) * this.CARD_SPACING;
        const startX = (this.scene.cameras.main.width - totalWidth) / 2;
        const baseY = this.scene.cameras.main.height - this.BOTTOM_MARGIN;

        cards.forEach((card: CardModel, index: number) => {
            const cardView = this.cardViews.get(card);
            if (cardView) {
                const x = startX + (index * this.CARD_SPACING);
                const y = baseY - (card.isCardSelected() ? this.SELECTED_OFFSET : 0);
                
                cardView.setPosition(x, y);
                cardView.setDepth(index); // Ensure proper layering
            }
        });
    }
    
    /**
     * Animate adding a card to the hand
     */
    public animateCardAdded(card: CardModel, cardView: CardView, startX: number, startY: number): void {
        // Calculate the target position
        const cards = this.model.getCards();
        const index = cards.indexOf(card);
        if (index === -1) return;
        
        const totalWidth = (cards.length - 1) * this.CARD_SPACING;
        const startPosX = (this.scene.cameras.main.width - totalWidth) / 2;
        const baseY = this.scene.cameras.main.height - this.BOTTOM_MARGIN;
        
        const targetX = startPosX + (index * this.CARD_SPACING);
        const targetY = baseY;
        
        // Set initial position
        cardView.setPosition(startX, startY);
        
        // Set a high depth to ensure it's above other cards during animation
        cardView.setDepth(1000);
        
        // Store the card view
        this.cardViews.set(card, cardView);
        
        // Make sure card is selectable
        card.setSelectable(true);
        
        // Emit animation started event
        this.eventBus.emit(GameEvents.CARD_ANIMATION_STARTED, card);
        
        // Create animation
        this.scene.tweens.add({
            targets: cardView,
            x: targetX,
            y: targetY,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Flip the card when it reaches its destination
                card.flip(true);
                
                // Reset depth to proper value
                cardView.setDepth(index);
                
                // Emit animation completed event
                this.eventBus.emit(GameEvents.CARD_ANIMATION_COMPLETED, card);
                
                // Arrange cards (in case other cards were added/removed during animation)
                this.arrangeCards();
            }
        });
    }
    
    /**
     * Get a card view for a specific card model
     */
    public getCardView(card: CardModel): CardView | undefined {
        return this.cardViews.get(card);
    }
    
    /**
     * Destroy all resources
     */
    public destroy(): void {
        // Clean up event listeners
        this.eventBus.removeAllListeners(GameEvents.HAND_UPDATED);
        this.eventBus.removeAllListeners(GameEvents.HAND_SORTED);
        
        // Destroy UI elements
        this.playHandButton.destroy();
        this.discardButton.destroy();
        this.sortContainer.destroy();
        this.handCountText.destroy();
        
        // Destroy all card views
        this.cardViews.forEach(view => view.destroy());
        this.cardViews.clear();
    }
    
    /**
     * Debug method to log the number of card views
     */
    public debugCardViews(): void {
        console.log(`Card views in HandView: ${this.cardViews.size}`);
        console.log(`Cards in HandModel: ${this.model.getCards().length}`);
        
        // Check for orphaned card views
        const cards = this.model.getCards();
        this.cardViews.forEach((cardView, card) => {
            if (!cards.includes(card)) {
                console.log(`Orphaned card view found: ${card.suit} ${card.rank}`);
            }
        });
    }
} 