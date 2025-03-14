import EventBus from '../../base/EventBus';
import { GameEvents } from '../../data/GameEvents';
import { CardModel } from './models/CardModel';
import { DeckModel } from './models/DeckModel';
import { HandModel } from './models/HandModel';

export class GameplayService {
    private static instance: GameplayService;
    private handModel: HandModel;
    private deckModel: DeckModel;
    private initialized: boolean = false;
    private eventBus: EventBus;


    public static getInstance(): GameplayService {
        if (!GameplayService.instance) {
            GameplayService.instance = new GameplayService();
        }
        return GameplayService.instance;
    }

    public initialize(): void {
        if (this.initialized) { 
            return;
        }
        this.deckModel = new DeckModel();
        this.handModel = new HandModel();
        this.initialized = true;
        this.eventBus = EventBus.getInstance();
    }

    // Deck operations
    public getDeckModel(): DeckModel {
        return this.deckModel;
    }

    public shuffleDeck(): void {
        this.deckModel.shuffle();
    }

    public drawCard(): CardModel | undefined {
        return this.deckModel.drawCard();
    }

    // Hand operations
    public getHandModel(): HandModel {
        return this.handModel;
    }

    public addCardToHand(card: CardModel): void {
        this.handModel.addCards([card]);
    }

    public removeCardFromHand(card: CardModel): void {
        this.handModel.removeCard(card);
    }

    // Game state operations
    public resetGame(): void {
        this.deckModel = new DeckModel();
        this.handModel = new HandModel();
    }
    
    public toggleCardSelection(card: CardModel): void {
        if (this.handModel.isCardSelected(card)) {
            this.handModel.deselectCard(card);
            this.eventBus.emit(GameEvents.CARD_DESELECTED, card);
        } else {
            this.handModel.selectCard(card);
            this.eventBus.emit(GameEvents.CARD_SELECTED, card);
        }
    }
} 