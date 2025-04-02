import { GAME_CONFIG } from "../config/game-config";
import { THEME_CONFIG } from "../config/theme-config";
import { BaseScene } from "./base-scene";
import { Button } from "../ui/button";
import { RoundedContainer } from "../ui/rounded-container";
import { createThemedText } from "../utils/game-utils";

interface GameOverSceneData {
    isWin: boolean;
    score: number;
    money: number;
    round: number;
}

export class GameOverScene extends BaseScene {
    private isWin: boolean = false;
    private score: number = 0;
    private money: number = 0;
    private round: number = 0;
    private mainPanel!: RoundedContainer;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data: GameOverSceneData): void {
        this.isWin = data.isWin;
        this.score = data.score;
        this.money = data.money;
        this.round = data.round;
    }

    create(): void {
        // Tạo background màu tối
        this.add.rectangle(
            GAME_CONFIG.SCREEN_WIDTH / 2,
            GAME_CONFIG.SCREEN_HEIGHT / 2,
            GAME_CONFIG.SCREEN_WIDTH,
            GAME_CONFIG.SCREEN_HEIGHT,
            0x000000,
            0.8
        );

        // Tạo container chính dùng RoundedContainer cho panel game over
        const panelColor = this.isWin ? THEME_CONFIG.COLORS.BALATRO.BLUE : THEME_CONFIG.COLORS.BALATRO.RED;
        const borderColor = this.isWin ? 0x00AAFF : 0xFF4466;
        
        this.mainPanel = new RoundedContainer(this, {
            x: GAME_CONFIG.SCREEN_WIDTH / 2,
            y: GAME_CONFIG.SCREEN_HEIGHT / 2 - 50,
            width: 500,
            height: 450,
            backgroundColor: panelColor,
            borderColor: borderColor,
            borderWidth: 5,
            radius: 20
        });
        
        // Thêm glow effect cho panel
        const glow = this.rexUI.add.roundRectangle(
            GAME_CONFIG.SCREEN_WIDTH / 2, 
            GAME_CONFIG.SCREEN_HEIGHT / 2 - 50, 
            530, 480, 30,
            borderColor,
            0.3
        );
        glow.setDepth(-1);
        
        // Tiêu đề
        const titleColor = this.isWin ? 0xFFFFFF : 0xFFAAAA;
        const titleText = createThemedText(
            this,
            0, -180,
            this.isWin ? 'THẮNG CUỘC!' : 'THUA CUỘC!',
            {
                fontSize: THEME_CONFIG.FONTS.SIZES.XLARGE,
                color: titleColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        this.mainPanel.add(titleText);

        // Icon thắng/thua (giả sử chúng ta tạo một hình ảnh đơn giản thay thế)
        try {
            const icon = this.add.image(
                0, -120,
                'icons',
                this.isWin ? 'win' : 'lose'
            );
            icon.setScale(1.5);
            this.mainPanel.add(icon);
        } catch (error) {
            // Tạo icon thay thế nếu không có asset
            const iconColor = this.isWin ? 0x00FF00 : 0xFF0000;
            const iconCircle = this.add.circle(0, -120, 30, iconColor);
            this.mainPanel.add(iconCircle);
        }
        
        // Thông tin vòng chơi
        const roundText = createThemedText(
            this,
            0, -60,
            `Vòng: ${this.round}`,
            {
                fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM,
                color: 0xFFFFFF,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        this.mainPanel.add(roundText);
        
        // Thông tin điểm số
        const scoreText = createThemedText(
            this,
            0, -20,
            `Điểm: ${this.score}`,
            {
                fontSize: THEME_CONFIG.FONTS.SIZES.LARGE,
                color: 0xFFFFFF,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        this.mainPanel.add(scoreText);
        
        // Thông tin tiền
        const moneyText = createThemedText(
            this,
            0, 40,
            `Tiền: $${this.money}`,
            {
                fontSize: THEME_CONFIG.FONTS.SIZES.LARGE,
                color: 0xFFD700,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        this.mainPanel.add(moneyText);
        
        // Nút chơi lại sử dụng Button class
        const restartButton = new Button(this, {
            x: 0,
            y: 110,
            width: 200,
            height: 60,
            text: 'CHƠI LẠI',
            backgroundColor: 0x0077CC,
            textColor: 0xFFFFFF,
            fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM,
            onClick: () => {
                this.scene.start('GameScene');
            }
        });
        this.mainPanel.add(restartButton);
        
        // Nút về menu chính
        const menuButton = new Button(this, {
            x: 0,
            y: 190,
            width: 200,
            height: 60,
            text: 'MENU CHÍNH',
            backgroundColor: 0x555555,
            textColor: 0xFFFFFF,
            fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM,
            onClick: () => {
                this.scene.start('MenuScene');
            }
        });
        this.mainPanel.add(menuButton);

        // Thêm vào scene
        this.add.existing(this.mainPanel);

        // Hiệu ứng animation
        this.createEntryAnimation();

        // Thêm hiệu ứng shining cho nút nếu thắng
        if (this.isWin) {
            this.createShiningEffect(restartButton);
        }
    }
    
    /**
     * Tạo hiệu ứng animation khi màn hình xuất hiện
     */
    private createEntryAnimation(): void {
        this.mainPanel.setScale(0.8);
        this.mainPanel.y = GAME_CONFIG.SCREEN_HEIGHT + 200;
        
        this.tweens.add({
            targets: this.mainPanel,
            y: GAME_CONFIG.SCREEN_HEIGHT / 2 - 50,
            scale: 1,
            duration: 800,
            ease: 'Bounce.Out'
        });
    }

    /**
     * Tạo hiệu ứng phát sáng cho nút
     */
    private createShiningEffect(button: Button): void {
        this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 1500,
            loop: -1,
            ease: 'Sine.InOut',
            onUpdate: (tween) => {
                const value = tween.getValue();
                const alpha = Math.abs(Math.sin(value / 100 * Math.PI)) * 0.4 + 0.6;
                button.alpha = alpha;
            }
        });
    }
} 