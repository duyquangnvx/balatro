import { Scene } from 'phaser';
import { THEME_CONFIG } from '../config/theme-config';
import { Button } from './button';
import { createThemedText } from '../utils/game-utils';
import { RoundedContainer } from './rounded-container';

// Định nghĩa enum BlindType
export enum BlindType {
    SMALL_BLIND = 'small_blind',
    BIG_BLIND = 'big_blind',
    DEALER = 'dealer',
    ANTE = 'ante',
    FLOP = 'flop',
    TURN = 'turn',
    RIVER = 'river'
}

export interface BlindPanelConfig {
    x: number;
    y: number;
    width?: number;
    height?: number;
}

export class BlindPanel extends Phaser.GameObjects.Container {
    private backgroundContainer: RoundedContainer;
    private titleBar: RoundedContainer;
    private scorePanel: RoundedContainer;
    private roundScorePanel: RoundedContainer;
    private pokerHandPanel: RoundedContainer;
    private runInfoButton: Button;
    private optionsButton: Button;
    private moneyDisplay: RoundedContainer;
    private handsDisplay: RoundedContainer;
    private discardsDisplay: RoundedContainer;
    private anteDisplay: RoundedContainer;
    private roundDisplay: RoundedContainer;
    private scoreDisplayContainer: RoundedContainer;
    private chipIcon: Phaser.GameObjects.Image;
    private targetScoreContainer: RoundedContainer;
    private targetChipIcon: Phaser.GameObjects.Image;
    private rewardContainer: Phaser.GameObjects.Container;
    private rewardText: Phaser.GameObjects.BitmapText;
    private moneyRewardText: Phaser.GameObjects.BitmapText;

    // Lưu trữ text elements để dễ dàng truy cập và cập nhật
    private titleText!: Phaser.GameObjects.BitmapText;
    private targetScoreText!: Phaser.GameObjects.BitmapText;
    private currentScoreText!: Phaser.GameObjects.BitmapText;
    private pokerHandText!: Phaser.GameObjects.BitmapText;
    private chipsValueText!: Phaser.GameObjects.BitmapText;
    private multiplierText!: Phaser.GameObjects.BitmapText;
    private handsValueText!: Phaser.GameObjects.BitmapText;
    private discardsValueText!: Phaser.GameObjects.BitmapText;
    private moneyValueText!: Phaser.GameObjects.BitmapText;
    private anteValueText!: Phaser.GameObjects.BitmapText;
    private roundValueText!: Phaser.GameObjects.BitmapText;

    // Cấu hình màu sắc
    private readonly backgroundColor = 0x2B3234;
    private readonly borderColor = 0x006AAC;
    private readonly titleBarColor = 0x00619D;
    private readonly scoreContainerColor = 0x0A3B55;
    private readonly scoreDisplayColor = 0x1C2427;
    private readonly textColor = 0xFFFFFF;
    private readonly scoreColor = 0xE15245;
    private readonly moneyColor = 0xED8D00;
    private readonly blueButtonColor = 0x0098F8;
    private readonly redButtonColor = 0xEC4D3C;
    private readonly yellowButtonColor = 0xF2A516;

    constructor(scene: Scene, config: BlindPanelConfig) {
        super(scene, config.x, config.y);

        const width = config.width || 300;
        const height = config.height || 600;

        // Tạo container nền với viền
        this.backgroundContainer = new RoundedContainer(scene, {
            x: 0,
            y: 0,
            width: width,
            height: height,
            backgroundColor: this.backgroundColor,
            borderColor: this.borderColor,
            borderWidth: 2,
            radius: 2  // Viền chỉ có ở hai bên nên bo góc nhỏ
        });
        this.add(this.backgroundContainer);

        // Tạo và thêm các phần tử UI
        this.createComponents(width, height);

        // Thêm vào scene
        scene.add.existing(this);
    }

    private createComponents(width: number, height: number): void {
        const panelPadding = 15;
        const elementSpacing = 10;
        const roundedRectRadius = 8;
        
        let yPosition = -height/2 + panelPadding;
        
        // 1. Title Bar - Tên của blind hiện tại
        this.titleBar = this.createTitleBar(0, yPosition, width - 2 * panelPadding, 40);
        this.add(this.titleBar);
        
        yPosition += 40 + elementSpacing;
        
        // 2. Score Panel - Thông tin về mục tiêu điểm
        this.scorePanel = this.createScorePanel(0, yPosition, width - 2 * panelPadding, 140);
        this.add(this.scorePanel);
        
        yPosition += 140 + elementSpacing;
        
        // 3. Round Score Panel - Hiển thị điểm hiện tại
        this.roundScorePanel = this.createRoundScorePanel(0, yPosition, width - 2 * panelPadding, 50);
        this.add(this.roundScorePanel);
        
        yPosition += 50 + elementSpacing;
        
        // 4. Poker Hand Panel - Hiển thị poker hand hiện tại
        this.pokerHandPanel = this.createPokerHandPanel(0, yPosition, width - 2 * panelPadding, 120);
        this.add(this.pokerHandPanel);
        
        yPosition += 120 + elementSpacing;
        
        // 5. Run Info and Options Buttons
        const buttonWidth = (width - 2 * panelPadding - elementSpacing) / 2;
        
        this.runInfoButton = new Button(this.scene, {
            x: -buttonWidth/2 - elementSpacing/2,
            y: yPosition + 40,
            width: buttonWidth,
            height: 80,
            text: 'Run\nInfo',
            backgroundColor: this.redButtonColor,
            textColor: this.textColor,
            fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM,
        });
        this.add(this.runInfoButton);
        
        this.optionsButton = new Button(this.scene, {
            x: buttonWidth/2 + elementSpacing/2,
            y: yPosition + 40,
            width: buttonWidth,
            height: 80,
            text: 'Options',
            backgroundColor: this.yellowButtonColor,
            textColor: this.textColor,
            fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM,
        });
        this.add(this.optionsButton);
        
        yPosition += 85 + elementSpacing;
        
        // 6. Hands and Discards Display
        const smallDisplayWidth = (width - 2 * panelPadding - elementSpacing) / 2;
        
        this.handsDisplay = this.createCounterDisplay(
            -smallDisplayWidth/2 - elementSpacing/2, 
            yPosition + 25, 
            smallDisplayWidth, 
            60, 
            'Hands', 
            '0'
        );
        this.add(this.handsDisplay);
        
        this.discardsDisplay = this.createCounterDisplay(
            smallDisplayWidth/2 + elementSpacing/2, 
            yPosition + 25, 
            smallDisplayWidth, 
            60, 
            'Discards', 
            '0'
        );
        this.add(this.discardsDisplay);
        
        yPosition += 60 + elementSpacing;
        
        // 7. Money Display
        this.moneyDisplay = this.createMoneyDisplay(0, yPosition + 25, width - 2 * panelPadding, 60, '$0');
        this.add(this.moneyDisplay);
        
        yPosition += 60 + elementSpacing;
        
        // 8. Ante and Round Display
        const smallDisplay2Width = (width - 2 * panelPadding - elementSpacing) / 2;
        
        this.anteDisplay = this.createCounterDisplay(
            -smallDisplay2Width/2 - elementSpacing/2, 
            yPosition + 25, 
            smallDisplay2Width, 
            60, 
            'Ante', 
            '1/8'
        );
        this.add(this.anteDisplay);
        
        this.roundDisplay = this.createCounterDisplay(
            smallDisplay2Width/2 + elementSpacing/2, 
            yPosition + 25, 
            smallDisplay2Width, 
            60, 
            'Round', 
            '1'
        );
        this.add(this.roundDisplay);
    }

    private createTitleBar(x: number, y: number, width: number, height: number): RoundedContainer {
        // Tạo rounded container cho title bar
        const container = new RoundedContainer(this.scene, {
            x: x,
            y: y + height/2,
            width: width,
            height: height,
            backgroundColor: this.titleBarColor,
            radius: 8
        });
        
        // Text
        this.titleText = createThemedText(
            this.scene, 
            0, -4,
            'Small Blind',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.LARGE,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        container.add(this.titleText);
        
        return container;
    }

    private createScorePanel(x: number, y: number, width: number, height: number): RoundedContainer {
        // Tạo rounded container cho score panel
        const container = new RoundedContainer(this.scene, {
            x: x,
            y: y + height/2,
            width: width,
            height: height,
            backgroundColor: this.scoreContainerColor,
            radius: 8
        });
        
        // Blind Icon
        const blindIcon = this.scene.add.image(-width/2 + 40, 0, 'icons', 'blind');
        blindIcon.setScale(0.8);
        container.add(blindIcon);
        
        // Tạo container con cho score display
        const scoreContainerWidth = 160;
        const scoreContainerHeight = height - 60;
        const scoreContainerMarginRight = 6;
        
        this.targetScoreContainer = new RoundedContainer(this.scene, {
            x: width/2 - scoreContainerWidth/2 - scoreContainerMarginRight,
            y: 0,
            width: scoreContainerWidth,
            height: scoreContainerHeight,
            backgroundColor: this.scoreDisplayColor,
            radius: 8
        });
        
        // "Score at least" text
        const scoreAtLeastText = createThemedText(
            this.scene, 
            0, -scoreContainerHeight/3,
            'Score at least',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.TINY,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        this.targetScoreContainer.add(scoreAtLeastText);
        
        // Chip icon
        this.targetChipIcon = this.scene.add.image(
            -30,
            0,
            'chips',
            'white.png'
        );
        this.targetChipIcon.setScale(0.5);
        this.targetScoreContainer.add(this.targetChipIcon);
        
        // Target score
        this.targetScoreText = createThemedText(
            this.scene, 
            10, -4,
            '300',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.LARGE,
                color: this.scoreColor,
                origin: { x: 0, y: 0.5 }
            }
        );
        this.targetScoreContainer.add(this.targetScoreText);
        
        // Reward text và Money trong một dòng
        this.rewardContainer = new Phaser.GameObjects.Container(
            this.scene,
            0,
            scoreContainerHeight/3
        );
        
        // Reward text (màu trắng)
        this.rewardText = createThemedText(
            this.scene, 
            -30, 0,
            'Reward:',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.TINY,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        this.rewardContainer.add(this.rewardText);
        
        // Money text (màu moneyColor)
        this.moneyRewardText = createThemedText(
            this.scene, 
            30, -2,
            '$$$',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM,
                color: this.moneyColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        this.rewardContainer.add(this.moneyRewardText);
        
        // Thêm reward container vào target score container
        this.targetScoreContainer.add(this.rewardContainer);
        
        // Thêm target score container vào container chính
        container.add(this.targetScoreContainer);
        
        // Căn giữa ban đầu
        this.centerTargetScoreElements();
        this.centerRewardElements();
        
        return container;
    }

    private centerTargetScoreElements(): void {
        if (!this.targetScoreText || !this.targetChipIcon || !this.targetScoreContainer) {
            return;
        }
        
        // Lấy chiều rộng của text hiện tại
        const textWidth = this.targetScoreText.width;
        
        // Lấy chiều rộng của chip icon
        const iconWidth = this.targetChipIcon.width * this.targetChipIcon.scaleX;
        
        // Tính toán tổng chiều rộng của cả text và icon (cộng thêm khoảng cách 5px giữa chúng)
        const totalWidth = textWidth + iconWidth + 5;
        
        // Đặt vị trí chip icon sao cho nó nằm bên trái của trung tâm
        this.targetChipIcon.x = -totalWidth / 2 + iconWidth / 2;
        
        // Đặt vị trí text sao cho nó nằm bên phải của trung tâm
        this.targetScoreText.x = this.targetChipIcon.x + iconWidth / 2 + 5 + textWidth / 2;
        this.targetScoreText.setOrigin(0.5, 0.5); // Đảm bảo origin là center
    }

    private centerRewardElements(): void {
        if (!this.rewardText || !this.moneyRewardText || !this.rewardContainer) {
            return;
        }
        
        // Lấy chiều rộng của các text
        const rewardTextWidth = this.rewardText.width;
        const moneyTextWidth = this.moneyRewardText.width;
        
        // Tính toán tổng chiều rộng (cộng thêm khoảng cách 10px giữa chúng)
        const totalWidth = rewardTextWidth + moneyTextWidth + 10;
        
        // Đặt vị trí reward text sao cho nó nằm bên trái của trung tâm
        this.rewardText.x = -totalWidth / 2 + rewardTextWidth / 2;
        
        // Đặt vị trí money text sao cho nó nằm bên phải của trung tâm
        this.moneyRewardText.x = this.rewardText.x + rewardTextWidth / 2 + 10 + moneyTextWidth / 2;
    }

    private createRoundScorePanel(x: number, y: number, width: number, height: number): RoundedContainer {
        // Tạo rounded container cho round score panel
        const container = new RoundedContainer(this.scene, {
            x: x,
            y: y + height/2,
            width: width,
            height: height,
            backgroundColor: this.scoreDisplayColor,
            radius: 8
        });
        
        // "Round score" text
        const roundScoreText = createThemedText(
            this.scene, 
            -width/2 + 40, 0,
            'Round\nscore',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.SMALL,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        container.add(roundScoreText);
        
        // Tạo container con cho score display
        const scoreContainerMarginRight = 6;
        const scoreContainerWidth = width * 2 /  3;
        const scoreContainerHeight = height - 10;
        
        this.scoreDisplayContainer = new RoundedContainer(this.scene, {
            x: width/2 - scoreContainerWidth/2 - scoreContainerMarginRight,
            y: 0,
            width: scoreContainerWidth,
            height: scoreContainerHeight,
            backgroundColor: 0x2F3238,
            radius: 8
        });
        
        // Thêm chip icon
        this.chipIcon = this.scene.add.image(
            -10,
            0,
            'chips',
            'white.png'
        );
        this.chipIcon.setScale(0.5);
        this.scoreDisplayContainer.add(this.chipIcon);
        
        // Thêm text điểm số
        this.currentScoreText = createThemedText(
            this.scene, 
            10, -4,
            '23',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.LARGE,
                color: this.textColor,
                origin: { x: 0, y: 0.5 }
            }
        );
        this.scoreDisplayContainer.add(this.currentScoreText);
        
        // Thêm container con vào container chính
        container.add(this.scoreDisplayContainer);
        
        // Căn giữa các phần tử ban đầu
        this.centerScoreElements();
        
        return container;
    }

    private centerScoreElements(): void {
        if (!this.currentScoreText || !this.chipIcon || !this.scoreDisplayContainer) {
            return;
        }
        
        // Lấy chiều rộng của text hiện tại
        const textWidth = this.currentScoreText.width;
        
        // Lấy chiều rộng của chip icon
        const iconWidth = this.chipIcon.width * this.chipIcon.scaleX;
        
        // Tính toán tổng chiều rộng của cả text và icon (cộng thêm khoảng cách 5px giữa chúng)
        const totalWidth = textWidth + iconWidth + 5;
        
        // Đặt vị trí chip icon sao cho nó nằm bên trái của trung tâm
        this.chipIcon.x = -totalWidth / 2 + iconWidth / 2;
        
        // Đặt vị trí text sao cho nó nằm bên phải của trung tâm
        this.currentScoreText.x = this.chipIcon.x + iconWidth / 2 + 5 + textWidth / 2;
        this.currentScoreText.setOrigin(0.5, 0.5); // Đảm bảo origin là center
    }

    private createPokerHandPanel(x: number, y: number, width: number, height: number): RoundedContainer {
        // Tạo rounded container cho poker hand panel
        const container = new RoundedContainer(this.scene, {
            x: x,
            y: y + height/2,
            width: width,
            height: height,
            backgroundColor: this.scoreDisplayColor,
            radius: 8
        });
        
        // Poker hand name
        this.pokerHandText = createThemedText(
            this.scene, 
            0, -height/4,
            'Pair lvl.1',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.LARGE,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        container.add(this.pokerHandText);
        
        // Chips display (left)
        const chipsBox = new RoundedContainer(this.scene, {
            x: -width/4 - 5,
            y: height/5,
            width: width/2 - 30,
            height: height/2 - 10,
            backgroundColor: this.redButtonColor,
            radius: 8
        });
        
        // Chips value
        this.chipsValueText = createThemedText(
            this.scene, 
            0, -4,
            '10',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM_LARGE,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        chipsBox.add(this.chipsValueText);
        container.add(chipsBox);
        
        // Thêm text "X" ở giữa để thể hiện phép nhân
        const multiplySymbol = createThemedText(
            this.scene, 
            0, height/5,
            'X',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.LARGE,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        container.add(multiplySymbol);
        
        // Multiplier display (right)
        const multiplierBox = new RoundedContainer(this.scene, {
            x: width/4 + 5,
            y: height/5,
            width: width/2 - 30,
            height: height/2 - 10,
            backgroundColor: this.blueButtonColor,
            radius: 8
        });
        
        // Multiplier value
        this.multiplierText = createThemedText(
            this.scene, 
            0, -4,
            '2',
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.MEDIUM_LARGE,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        multiplierBox.add(this.multiplierText);
        container.add(multiplierBox);
        
        return container;
    }

    private createCounterDisplay(x: number, y: number, width: number, height: number, label: string, value: string): RoundedContainer {
        // Tạo rounded container cho counter display
        const container = new RoundedContainer(this.scene, {
            x: x,
            y: y,
            width: width,
            height: height,
            backgroundColor: this.scoreDisplayColor,
            radius: 8
        });
        
        // Label
        const labelText = createThemedText(
            this.scene, 
            0, -height/2 + 10,
            label,
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.TINY,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        container.add(labelText);
        
        // Value
        const valueText = createThemedText(
            this.scene, 
            0, 5,
            value,
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.LARGE,
                color: this.textColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        container.add(valueText);
        
        // Lưu trữ tham chiếu đến valueText
        if (label === 'Hands') {
            this.handsValueText = valueText;
        } else if (label === 'Discards') {
            this.discardsValueText = valueText;
        } else if (label === 'Ante') {
            this.anteValueText = valueText;
        } else if (label === 'Round') {
            this.roundValueText = valueText;
        }
        
        return container;
    }

    private createMoneyDisplay(x: number, y: number, width: number, height: number, value: string): RoundedContainer {
        // Tạo rounded container cho money display
        const container = new RoundedContainer(this.scene, {
            x: x,
            y: y,
            width: width,
            height: height,
            backgroundColor: this.scoreDisplayColor,
            radius: 8
        });
        
        // Money value
        this.moneyValueText = createThemedText(
            this.scene, 
            0, -4,
            value,
            { 
                fontSize: THEME_CONFIG.FONTS.SIZES.XLARGE,
                color: this.moneyColor,
                origin: { x: 0.5, y: 0.5 }
            }
        );
        container.add(this.moneyValueText);
        
        return container;
    }

    /**
     * Cập nhật thông tin về blind hiện tại
     */
    public updateBlind(name: string, chips: number): void {
        // Cập nhật tiêu đề và icon blind
        this.titleText.setText(name);
        
        // Cập nhật target score
        this.targetScoreText.setText(chips.toString());
        
        // Căn giữa lại các phần tử sau khi cập nhật target score
        this.centerTargetScoreElements();
    }

    /**
     * Cập nhật thông tin về điểm
     */
    public updateScore(score: number): void {
        // Cập nhật điểm hiện tại
        this.currentScoreText.setText(score.toString());
        
        // Căn giữa lại các phần tử sau khi cập nhật text
        this.centerScoreElements();
    }

    /**
     * Cập nhật thông tin ante và round
     */
    public updateAnteAndRound(currentAnte: number, totalAntes: number, currentRound: number): void {
        // Cập nhật ante
        this.anteValueText.setText(`${currentAnte}/${totalAntes}`);
        
        // Cập nhật round
        this.roundValueText.setText(currentRound.toString());
    }

    /**
     * Cập nhật thông tin hands và discards còn lại
     */
    public updateHandsAndDiscards(hands: number, discards: number): void {
        // Cập nhật hands
        this.handsValueText.setText(hands.toString());
        
        // Cập nhật discards
        this.discardsValueText.setText(discards.toString());
    }

    /**
     * Cập nhật số tiền hiện tại
     */
    public updateMoney(money: number): void {
        // Cập nhật money ở display chính
        this.moneyValueText.setText(`$${money}`);
        
        // Cập nhật money ở reward display nếu cần
        if (this.moneyRewardText) {
            this.moneyRewardText.setText(`$${money}`);
            this.centerRewardElements();
        }
    }
}
