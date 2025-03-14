import { Scene } from 'phaser';
import { GameplayService } from './GameplayService';
import { DeckView } from './views/DeckView';
import { HandView } from './views/HandView';
import { CardView } from './views/CardView';

export class GameplayScene extends Scene {
    private gameplayService: GameplayService;
    private handView: HandView;
    private deckView: DeckView;

    constructor() {
        super({ key: 'GameplayScene' });
        this.gameplayService = GameplayService.getInstance();
    }
} 