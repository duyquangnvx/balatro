import { Scene, GameObjects } from 'phaser';
import { HandModel } from '../models/HandModel';
import { CardView } from './CardView';
import EventBus from '../../../base/EventBus';
import { GameEvents } from '../../../data/GameEvents';
import { GameplayService } from '../GameplayService';
import { CardModel } from '../models/CardModel';
export class HandView extends GameObjects.Container {
    private gameService: GameplayService;
    private model: HandModel;
    private cardViews: CardView[] = [];
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

    constructor(scene: Scene) {
        super(scene, 0, 0);
        this.gameService = GameplayService.getInstance();
        this.model = this.gameService.getHandModel();
        this.eventBus = EventBus.getInstance();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Create UI elements
        this.createButtons();
        
        // Initialize card views
        this.initializeCardViews();
    }

    private setupEventListeners(): void {
        this.eventBus.on(GameEvents.CARD_SELECTED, this.onCardSelected.bind(this));
        this.eventBus.on(GameEvents.CARD_DESELECTED, this.onCardDeselected.bind(this));
    }

    private onCardSelected(cardModel: CardModel): void {
        if (this.model.getCards().includes(cardModel)) {
            this.model.selectCard(cardModel);
            this.arrangeCards();
        }
    }

    private onCardDeselected(cardModel: CardModel): void {
        this.model.deselectCard(cardModel);
        this.arrangeCards();
    }

    private createButtons(): void {
        const centerX = this.scene.cameras.main.width / 2;
        const buttonY = this.scene.cameras.main.height - 50;
        
        // Create Play Hand button
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
        
        // Create sort container
        this.sortContainer = this.scene.add.container(centerX, buttonY);
        
        // Background for sort container
        const sortBackground = this.scene.add.graphics();
        sortBackground.fillStyle(0x006600, 1);
        sortBackground.fillRoundedRect(-80, -30, 160, 60, 10);
        sortBackground.lineStyle(2, 0xFFFFFF, 1);
        sortBackground.strokeRoundedRect(-80, -30, 160, 60, 10);
        this.sortContainer.add(sortBackground);
        
        // Sort title
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
        
        // Sort by Rank button
        this.sortByRankButton = this.scene.add.text(
            -40, 
            5, 
            'Rank', 
            {
                fontSize: '14px',
                color: '#000000',
                backgroundColor: '#FFA500',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setInteractive();
        this.sortContainer.add(this.sortByRankButton);
        
        // Sort by Suit button
        this.sortBySuitButton = this.scene.add.text(
            40, 
            5, 
            'Suit', 
            {
                fontSize: '14px',
                color: '#000000',
                backgroundColor: '#FFA500',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setInteractive();
        this.sortContainer.add(this.sortBySuitButton);
        
        // Discard button
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
        
        // Add event listeners
        this.playHandButton.on('pointerdown', () => {
            console.log('Play Hand clicked - to be implemented');
        });
        
        this.sortByRankButton.on('pointerdown', () => this.sortByRank());
        this.sortBySuitButton.on('pointerdown', () => this.sortBySuit());
        this.discardButton.on('pointerdown', () => this.discardSelectedCards());
    }

    private initializeCardViews(): void {
        // Clear existing card views
        this.cardViews.forEach(view => view.destroy());
        this.cardViews = [];
        
        // Create new card views for each card in the model
        this.model.getCards().forEach(cardModel => {
            const cardView = new CardView(this.scene, cardModel);
            cardView.setPosition(0, 0);
            this.cardViews.push(cardView);
            this.add(cardView);
        });
        
        // Arrange cards
        this.arrangeCards();
    }

    private arrangeCards(): void {
        const totalWidth = (this.cardViews.length - 1) * this.CARD_SPACING;
        const startX = (this.scene.cameras.main.width - totalWidth) / 2;
        const baseY = this.scene.cameras.main.height - this.BOTTOM_MARGIN;

        this.cardViews.forEach((cardView, index) => {
            const x = startX + (index * this.CARD_SPACING);
            const y = baseY - (this.model.isCardSelected(cardView.getModel()) ? this.SELECTED_OFFSET : 0);
            
            cardView.setPosition(x, y);
            cardView.setDepth(index);
        });
        
        // Update card count text
        const cardCountText = `${this.model.getCardCount()}/${this.model.getMaxCards()}`;
        
        // Find and update existing text or create new one
        let countText = this.scene.children.getByName('handCountText') as GameObjects.Text;
        if (!countText) {
            countText = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                baseY + 50,
                cardCountText,
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5).setName('handCountText');
        } else {
            countText.setText(cardCountText);
        }
    }

    private sortByRank(): void {
        // TODO: Implement rank sorting
        console.log('Sort by rank - to be implemented');
    }

    private sortBySuit(): void {
        // TODO: Implement suit sorting
        console.log('Sort by suit - to be implemented');
    }

    private discardSelectedCards(): void {
        const selectedCards = this.model.getSelectedCards();
        selectedCards.forEach(card => {
            this.model.removeCard(card);
        });
        this.initializeCardViews();
    }

    public updateView(): void {
        // Update all card views
        this.cardViews.forEach(view => view.updateView());
        
        // Re-arrange cards
        this.arrangeCards();
    }

    public getModel(): HandModel {
        return this.model;
    }

    public destroy(): void {
        this.cardViews.forEach(view => view.destroy());
        this.playHandButton.destroy();
        this.discardButton.destroy();
        this.sortContainer.destroy();
        this.eventBus.targetOff(this);
        super.destroy();
    }
} 