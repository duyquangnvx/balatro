import { Scene, GameObjects } from 'phaser';
import { HandModel } from '../models/HandModel';
import { CardView } from './CardView';
import { GameplayService } from '../GameplayService';

/**
 * HandView - UI representation of a Hand model
 */
export class HandView extends GameObjects.Container {
    private gameplayService: GameplayService;
    private model: HandModel;
    private cardViews: CardView[] = [];
    private readonly CARD_SPACING = 80;
    private readonly BOTTOM_MARGIN = 200;
    
    // UI elements
    private playHandButton: Phaser.GameObjects.Text;
    private discardButton: Phaser.GameObjects.Text;
    private sortContainer: Phaser.GameObjects.Container;
    private sortByRankButton: Phaser.GameObjects.Text;
    private sortBySuitButton: Phaser.GameObjects.Text;

    constructor(scene: Scene, model: HandModel) {
        super(scene);
        
        this.model = model;
        this.gameplayService = GameplayService.getInstance();

        // Create UI elements
        this.createButtons();
        
        // Initialize card views
        this.initializeCardViews();

        scene.add.existing(this);
    }


    private createButtons(): void {
        const centerX = 0; // Relative to container
        const buttonY = 80; // Below cards
        
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
        this.add(this.playHandButton);
        
        // Create container for Sort Hand and child buttons
        this.sortContainer = new GameObjects.Container(this.scene, centerX, buttonY);
        this.add(this.sortContainer);
        
        // Background for sort container
        const sortBackground = this.scene.add.graphics();
        sortBackground.fillStyle(0x006600, 1);
        sortBackground.fillRoundedRect(-80, -30, 160, 60, 10);
        sortBackground.lineStyle(2, 0xFFFFFF, 1);
        sortBackground.strokeRoundedRect(-80, -30, 160, 60, 10);
        this.sortContainer.add(sortBackground);
        
        // Sort Hand title
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
                backgroundColor: '#FFA500', // Orange
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
                backgroundColor: '#FFA500', // Orange
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
        this.add(this.discardButton);

        
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
        this.model.getCards().forEach(card => {
            const cardView = new CardView(this.scene, card);
            cardView.setPosition(0, 0);
            cardView.setOnClickCallback(this.onCardClicked.bind(this));
            this.cardViews.push(cardView);
            this.add(cardView);
        });
        
        // Arrange cards
        this.arrangeCards();
    }

    private onCardClicked(cardView: CardView): void {
        const cardModel = cardView.getModel();
        const wasSelected = this.model.isCardSelected(cardModel);
        this.model.toggleCardSelection(cardModel);
        
        if (wasSelected) {
            cardView.lowerDown();
        } else {
            cardView.liftUp();
        }     
    }

    private arrangeCards(animate: boolean = false): void {
        const totalWidth = (this.cardViews.length - 1) * this.CARD_SPACING;
        const startX = -totalWidth / 2; // Center relative to container
        const baseY = -this.BOTTOM_MARGIN;

        this.cardViews.forEach((cardView, index) => {
            // Find the card object for this card
            const x = startX + (index * this.CARD_SPACING);
            const y = baseY;
            
            if (animate) {
                // For animation, only animate the X position to avoid interfering with lift animation
                this.scene.tweens.add({
                    targets: cardView,
                    x: x,
                    duration: 300,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // After animation completes, ensure the Y position is correct
                        // This will respect the card's selected state
                        cardView.setPosition(cardView.x, y);
                    }
                });
            } else {
                // Immediately set position without animation
                cardView.setPosition(x, y);
            }
            
            cardView.setDepth(index); // Ensure proper layering
        });
    }

    private sortByRank(): void {
        this.model.sortByRank();
            this.arrangeCards(true); // Use animation
    }

    private sortBySuit(): void {
        this.model.sortBySuit();
        this.arrangeCards(true); // Use animation
    }

    private discardSelectedCards(): void {
        // todo: implement
        // const discardedCards = this.model.discardSelectedCards();

        // const currentDeck = this.gameplayService.getDeck();
        // const newCards = currentDeck.drawCards(discardedCards.length);
        // this.model.addCards(newCards);
        
        // this.initializeCardViews();
    }

    /**
     * Update the hand object based on model changes
     */
    public updateView(): void {
        // Update all card views
        this.cardViews.forEach(view => view.updateView());
        
        // Rearrange cards without animation for regular updates
        this.arrangeCards(false);
    }

    public getModel(): HandModel {
        return this.model;
    }

    public destroy(): void {
        this.cardViews.forEach(view => view.destroy());
        this.playHandButton.destroy();
        this.discardButton.destroy();
        this.sortContainer.destroy();
        super.destroy();
    }
} 