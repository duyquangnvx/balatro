import { Scene } from 'phaser';
import { DeckController } from './DeckController';
import { HandController } from './HandController';
import { DeckStyle } from '../models/DeckStyle';
import { CardModel } from '../models/CardModel';
import { Enhancement } from '../models/types';
import EventBus from '../../../base/EventBus';
import { GameEvents } from '../../../data/GameEvents';

/**
 * GameController - Quản lý tất cả các controller khác trong game
 */
export class GameController {
    private scene: Scene;
    private deckController: DeckController;
    private handController: HandController;
    private eventBus: EventBus;
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.eventBus = EventBus.getInstance();
        
        // Khởi tạo các controller
        this.deckController = new DeckController(scene);
        this.handController = new HandController(scene, this.deckController);
        
        // Đăng ký các sự kiện
        this.setupEventListeners();
    }
    
    /**
     * Thiết lập các event listener
     */
    private setupEventListeners(): void {
        // Xử lý sự kiện khi người chơi muốn rút thêm bài
        this.eventBus.on(GameEvents.UI_BUTTON_CLICKED, (buttonName: string) => {
            if (buttonName === 'drawCard') {
                this.handController.drawCardFromDeck();
            } else if (buttonName === 'discardAndDraw') {
                this.handController.discardAndDraw();
            }
        });
    }
    
    /**
     * Lấy DeckController
     */
    public getDeckController(): DeckController {
        return this.deckController;
    }
    
    /**
     * Lấy HandController
     */
    public getHandController(): HandController {
        return this.handController;
    }
    
    /**
     * Thay đổi kiểu mặt sau của bài
     */
    public setDeckStyle(style: DeckStyle): void {
        this.deckController.setDeckStyle(style);
    }
    
    /**
     * Lấy kiểu mặt sau hiện tại của bài
     */
    public getDeckStyle(): DeckStyle {
        return this.deckController.getDeckStyle();
    }
    
    /**
     * Lấy danh sách các lá bài đã chọn
     */
    public getSelectedCards(): CardModel[] {
        return this.handController.getModel().getSelectedCards();
    }
    
    /**
     * Thay đổi enhancement cho các lá bài đã chọn
     */
    public setEnhancementForSelectedCards(enhancement: Enhancement): void {
        const selectedCards = this.getSelectedCards();
        
        selectedCards.forEach(card => {
            card.setEnhancement(enhancement);
        });
    }
    
    /**
     * Xoá tài nguyên khi không cần thiết
     */
    public destroy(): void {
        this.handController.destroy();
        this.deckController.destroy();
        
        // Xoá các event listener
        this.eventBus.removeAllListeners(GameEvents.UI_BUTTON_CLICKED);
    }
} 