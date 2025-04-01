import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { Scene } from 'phaser';
import { BlindType } from '../config/game-config';
import { createBBCodeText, createLabel } from '../utils/game-utils';

export interface BlindPanelConfig {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface BlindDisplayData {
    name: string;
    targetScore: number;
    currentScore: number;
    multiplierLeft: number;
    multiplierRight: number;
    hands: number;
    discards: number;
    money: number;
    ante: number;
    totalAntes: number;
    round: number;
}

export class BlindPanel extends Phaser.GameObjects.Container {
    private mainPanel: UIPlugin.Sizer;
    private titleText: UIPlugin.BBCodeText;
    private targetScoreText: UIPlugin.BBCodeText;
    private currentScoreText: UIPlugin.BBCodeText;
    private multiplierText: UIPlugin.BBCodeText;
    private handsText: UIPlugin.BBCodeText;
    private discardsText: UIPlugin.BBCodeText;
    private moneyText: UIPlugin.BBCodeText;
    private anteText: UIPlugin.BBCodeText;
    private roundText: UIPlugin.BBCodeText;

    private displayData: BlindDisplayData = {
        name: 'Small Blind',
        targetScore: 300,
        currentScore: 0,
        multiplierLeft: 0,
        multiplierRight: 0,
        hands: 4,
        discards: 4,
        money: 4,
        ante: 1,
        totalAntes: 8,
        round: 1
    };

    // Colors
    private readonly darkBlueColor = 0x09435A;
    private readonly lightBlueColor = 0x00619D;
    private readonly darkGrayColor = 0x1D1F21;
    private readonly redColor = '#FF4440';
    private readonly orangeColor = '#FF8C00';
    private readonly whiteTextColor = '#FFFFFF';
    private readonly goldColor = '#FFD700';
    private readonly lightBlueTextColor = '#0096FF';

    constructor(scene: Scene, config: BlindPanelConfig) {
        super(scene, config.x, config.y);
        
        this.createMainPanel(config);
        
        scene.add.existing(this);
    }
    
    private createMainPanel(config: BlindPanelConfig): void {
        // Tạo main panel container trước
        this.mainPanel = this.scene.rexUI.add.sizer({
            orientation: 'vertical',
            x: 0,
            y: 0,
            width: config.width,
            height: config.height
        })
        .addBackground(
            this.scene.add.rectangle(0, 0, 0, 0, this.darkGrayColor)
                .setStrokeStyle(2, this.lightBlueColor)
        );
        
        // Create title label
        this.titleText = createBBCodeText(this.scene, 0, 0, this.displayData.name, {
            fontSize: '24px',
            color: this.whiteTextColor,
            fixedWidth: config.width,
            fixedHeight: 50,
            halign: 'center',
            valign: 'center'
        });
        
        const titleLabel = createLabel(this.scene, this.titleText, {
            background: this.scene.add.rectangle(0, 0, 0, 0, this.lightBlueColor),
            space: { left: 20, right: 20, top: 10, bottom: 10 },
            align: 'center',
            height: 50
        });
        
        // Create content sizer
        const contentSizer = this.scene.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 10, left: 10, right: 10, top: 10, bottom: 10 }
        });
        
        // Create blind info panel
        const blindInfoPanel = this.createBlindInfoPanel(config.width - 20);
        contentSizer.add(blindInfoPanel, 0, 'center', { top: 10, bottom: 10 }, false);
        
        // Create score panel
        const scorePanel = this.createScorePanel(config.width - 20);
        contentSizer.add(scorePanel, 0, 'center', { top: 5, bottom: 5 }, false);
        
        // Create multiplier panel
        const multiplierPanel = this.createMultiplierPanel(config.width - 20);
        contentSizer.add(multiplierPanel, 0, 'center', { top: 5, bottom: 5 }, false);
        
        // Create bottom panel with buttons and stats
        const bottomPanel = this.createButtonsAndStats(config.width - 20);
        contentSizer.add(bottomPanel, 1, 'center', { top: 5, bottom: 10 }, false);
        
        // Layout content sizer
        contentSizer.layout();
        
        // Thêm vào main panel
        this.mainPanel.add(titleLabel, 0, 'center', { top: 0 }, false);
        this.mainPanel.add(contentSizer, 1, 'center', { top: 0, bottom: 0, left: 0, right: 0 }, true);
        
        // Layout main panel
        this.mainPanel.layout();
        this.add(this.mainPanel);
    }

    private createBlindInfoPanel(width: number): UIPlugin.Sizer {
        // Tạo blind info container trước
        const blindInfoContainer = this.scene.rexUI.add.sizer({
            orientation: 'horizontal',
            width: width,
            height: 120,
            space: { item: 20, left: 10, right: 10 }
        })
        .addBackground(this.scene.add.rectangle(0, 0, 0, 0, this.darkBlueColor)
            .setStrokeStyle(0));
        
        // Tạo blind icon
        const blindIcon = this.scene.rexUI.add.roundRectangle(0, 0, 80, 80, 40, 0x2139A1) as any;
        blindIcon.setStrokeStyle(2, this.lightBlueColor);
        
        const blindIconText = createBBCodeText(this.scene, 0, 0, 'SMALL\nBLIND', {
            fontSize: '14px',
            color: this.whiteTextColor,
            align: 'center',
            fixedWidth: 70,
            fixedHeight: 70,
            halign: 'center',
            valign: 'center'
        });
        
        const blindIconLabel = createLabel(this.scene, blindIconText, {
            background: blindIcon,
            space: { left: 5, right: 5, top: 5, bottom: 5 },
            align: 'center'
        });
        
        // Tạo target score panel
        const targetScorePanel = this.scene.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 5, left: 10, right: 10, top: 10, bottom: 10 }
        })
        .addBackground(this.scene.add.rectangle(0, 0, 0, 0, 0x151617)
            .setStrokeStyle(1, 0x333333));
        
        // Thêm các đối tượng vào target score panel
        const scoreLabel = createBBCodeText(this.scene, 0, 0, 'Score at least', {
            fontSize: '16px',
            color: this.whiteTextColor
        });
        
        // Tạo score row sizer trước
        const scoreRow = this.scene.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 10 }
        });
        
        // Sau đó tạo và thêm chip icon và score text
        const chipIcon = this.scene.add.sprite(0, 0, 'chips', 'white.png');
        chipIcon.setScale(0.5);
        
        this.targetScoreText = createBBCodeText(this.scene, 0, 0, this.displayData.targetScore.toString(), {
            fontSize: '30px',
            color: '#FF4440'
        });
        
        scoreRow.add(chipIcon, 0, 'center', 0, false)
               .add(this.targetScoreText, 0, 'center', 0, false);
        
        // Layout score row
        scoreRow.layout();
        
        const rewardText = createBBCodeText(this.scene, 0, 0, 'Reward: $$$', {
            fontSize: '16px',
            color: this.goldColor
        });
        
        // Thêm vào panel
        targetScorePanel
            .add(scoreLabel, 0, 'center', 0, false)
            .add(scoreRow, 0, 'center', 0, false)
            .add(rewardText, 0, 'center', 0, false);
        
        // Layout target score panel
        targetScorePanel.layout();
        
        // Thêm vào container chính
        blindInfoContainer
            .add(blindIconLabel, 0, 'center', 0, false) 
            .add(targetScorePanel, 1, 'center', 0, false);
        
        // Layout blind info container
        blindInfoContainer.layout();
        
        return blindInfoContainer;
    }

    private createScorePanel(width: number): UIPlugin.Sizer {
        // Tạo score panel trước
        const scorePanel = this.scene.rexUI.add.sizer({
            orientation: 'horizontal',
            width: width,
            height: 60,
            space: { item: 20, left: 20, right: 20 }
        })
        .addBackground(this.scene.add.rectangle(0, 0, 0, 0, this.darkGrayColor)
            .setStrokeStyle(1, 0xFFFFFF));
        
        // Sau đó tạo và thêm các đối tượng con
        const scoreLabel = createBBCodeText(this.scene, 0, 0, 'Round\nscore', {
            fontSize: '18px',
            color: this.whiteTextColor,
            align: 'center',
            halign: 'center'
        });
        
        this.currentScoreText = createBBCodeText(this.scene, 0, 0, this.displayData.currentScore.toString(), {
            fontSize: '32px',
            color: this.lightBlueTextColor,
            align: 'center',
            halign: 'center'
        });
        
        // Tạo các label và thêm vào panel
        const scoreLabelWrap = createLabel(this.scene, scoreLabel, {
            align: 'center'
        });
        
        const scoreTextWrap = createLabel(this.scene, this.currentScoreText, {
            align: 'center'
        });
        
        scorePanel
            .add(scoreLabelWrap, 1, 'center', 0, false)
            .add(scoreTextWrap, 3, 'center', 0, false);
        
        // Layout score panel
        scorePanel.layout();
        
        return scorePanel;
    }

    private createMultiplierPanel(width: number): UIPlugin.Sizer {
        // Tạo multiplier panel trước
        const multiplierPanel = this.scene.rexUI.add.sizer({
            orientation: 'horizontal',
            width: width,
            height: 60,
            space: { item: 5, left: 10, right: 10 }
        })
        .addBackground(this.scene.add.rectangle(0, 0, 0, 0, this.darkGrayColor)
            .setStrokeStyle(1, 0xFFFFFF));
        
        // Tạo các thành phần nội dung
        const multiplierBox = this.scene.add.rectangle(0, 0, 40, 40, 0x333333)
            .setStrokeStyle(1, 0x666666);
        
        this.multiplierText = createBBCodeText(this.scene, 0, 0, `${this.displayData.multiplierLeft}x  ${this.displayData.multiplierRight}x`, {
            fontSize: '24px',
            color: this.orangeColor
        });
        
        const multiplierLabel = createLabel(this.scene, this.multiplierText, {
            background: multiplierBox,
            align: 'center'
        });
        
        multiplierPanel.add(multiplierLabel, 1, 'center', 0, false);
        
        // Layout multiplier panel
        multiplierPanel.layout();
        
        return multiplierPanel;
    }

    private createButtonsAndStats(width: number): UIPlugin.Sizer {
        // Tạo bottom panel trước
        const bottomPanel = this.scene.rexUI.add.sizer({
            orientation: 'horizontal',
            width: width,
            height: 160,
            space: { item: 10, left: 10, right: 10 }
        })
        .addBackground(this.scene.add.rectangle(0, 0, 0, 0, this.darkGrayColor)
            .setStrokeStyle(1, 0xFFFFFF));
        
        // Tạo sizer cho các nút
        const buttonsSizer = this.scene.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 10, top: 10, bottom: 10 }
        });
        
        // Thêm các nút
        const button1 = this.createButton('ANTE UP', 0xB8321E);
        const button2 = this.createButton('CASH OUT', 0x00619D);
        
        buttonsSizer.add(button1, 0, 'center', 0, false)
                    .add(button2, 0, 'center', 0, false);
        
        // Layout buttons sizer
        buttonsSizer.layout();
        
        // Tạo stats panel
        const statsPanel = this.scene.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 5, left: 10, right: 10, top: 10, bottom: 10 }
        })
        .addBackground(this.scene.add.rectangle(0, 0, 0, 0, 0x222222));
        
        // Thêm các thông tin sử dụng .toString() để chuyển đổi số thành chuỗi
        const hands = this.displayData.hands.toString();
        const [handsItem, handsValueText] = this.createStatsItem('Hands', hands, this.whiteTextColor, false);
        this.handsText = handsValueText;
        
        const discards = this.displayData.discards.toString();
        const [discardsItem, discardsValueText] = this.createStatsItem('Discards', discards, this.whiteTextColor, false);
        this.discardsText = discardsValueText;
        
        const money = this.displayData.money.toString();
        const [moneyItem, moneyValueText] = this.createStatsItem('Money', money, this.goldColor, true);
        this.moneyText = moneyValueText;
        
        const ante = this.displayData.ante.toString();
        const [anteItem, anteValueText] = this.createStatsItem('Ante', ante, this.redColor, true);
        this.anteText = anteValueText;
        
        const round = `${this.displayData.round}/${this.displayData.totalAntes}`;
        const [roundItem, roundValueText] = this.createStatsItem('Round', round, this.whiteTextColor, false);
        this.roundText = roundValueText;
        
        statsPanel
            .add(handsItem, 0, 'center', { bottom: 3 }, false)
            .add(discardsItem, 0, 'center', { bottom: 3 }, false)
            .add(moneyItem, 0, 'center', { bottom: 3 }, false)
            .add(anteItem, 0, 'center', { bottom: 3 }, false)
            .add(roundItem, 0, 'center', 0, false);
        
        // Layout stats panel
        statsPanel.layout();
        
        // Thêm vào bottom panel
        bottomPanel
            .add(buttonsSizer, 1, 'left', { left: 5 }, false)
            .add(statsPanel, 1, 'center', 0, false);
        
        // Layout bottom panel
        bottomPanel.layout();
        
        return bottomPanel;
    }

    private createButton(
        text: string,
        color: number,
        callback?: () => void
    ): UIPlugin.Label {
        const buttonBg = this.scene.rexUI.add.roundRectangle(0, 0, 160, 40, 10, color);
        
        const buttonText = createBBCodeText(this.scene, 0, 0, text, {
            fontSize: '20px',
            color: '#FFFFFF',
            halign: 'center'
        });
        
        const button = createLabel(this.scene, buttonText, {
            background: buttonBg,
            space: { left: 10, right: 10, top: 5, bottom: 5 },
            align: 'center'
        });
        
        // Thêm tính chất tương tác
        button.setInteractive({ useHandCursor: true })
              .on('pointerover', () => {
                  buttonBg.setStrokeStyle(2, 0xffffff);
              })
              .on('pointerout', () => {
                  buttonBg.setStrokeStyle(0);
              })
              .on('pointerdown', () => {
                  if (callback) callback();
              });
        
        return button;
    }

    private createStatsItem(
        label: string, 
        value: string, 
        color: string | number,
        isMoney: boolean = false
    ): [UIPlugin.Sizer, UIPlugin.BBCodeText] {
        // Tạo sizer trước
        const statsItem = this.scene.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 10 }
        });
        
        // Tạo các thành phần text
        const labelText = createBBCodeText(this.scene, 0, 0, label, {
            fontSize: '16px',
            color: this.whiteTextColor,
            halign: 'left'
        });
        
        // Chuyển đổi value thành chuỗi
        let valueString = value;
        if (isMoney) valueString = '$' + valueString;
        
        const valueText = createBBCodeText(this.scene, 0, 0, valueString, {
            fontSize: '16px',
            color: color,
            halign: 'right'
        });
        
        // Thêm vào sizer
        statsItem
            .add(labelText, 3, 'left', 0, false)
            .add(valueText, 2, 'right', 0, false);
        
        // Layout stats item
        statsItem.layout();
        
        return [statsItem, valueText];
    }

    /**
     * Update panel data
     */
    public updatePanel(data: Partial<BlindDisplayData>): void {
        // Cập nhật dữ liệu
        this.displayData = { ...this.displayData, ...data };
        
        // Cập nhật các hiển thị
        if (data.name) this.titleText.setText(data.name);
        if (data.targetScore) this.targetScoreText.setText(data.targetScore.toString());
        if (data.currentScore !== undefined) this.currentScoreText.setText(data.currentScore.toString());
        if (data.multiplierLeft !== undefined || data.multiplierRight !== undefined) {
            this.multiplierText.setText(`${this.displayData.multiplierLeft}x  ${this.displayData.multiplierRight}x`);
        }
        if (data.hands) this.handsText.setText(data.hands.toString());
        if (data.discards) this.discardsText.setText(data.discards.toString());
        if (data.money) this.moneyText.setText('$' + data.money.toString());
        if (data.ante) this.anteText.setText('$' + data.ante.toString());
        if (data.round !== undefined || data.totalAntes !== undefined) {
            this.roundText.setText(`${this.displayData.round}/${this.displayData.totalAntes}`);
        }
        
        // Layout để cập nhật hiển thị
        this.layoutAll();

        console.log('updatePanel', data);
    }

    /**
     * Layout all UI components
     */
    public layoutAll(): void {
        // Layout main panel
        if (this.mainPanel) {
            this.mainPanel.layout();
        }
    }

    /**
     * Update score display
     */
    public updateScore(score: number): void {
        this.updatePanel({
            currentScore: score
        });
    }

    /**
     * Update blind type and target score
     */
    public updateBlind(blindType: BlindType, name: string, targetScore: number): void {
        this.updatePanel({
            name,
            targetScore
        });
        
        // Thêm xử lý UI cập nhật theo loại blind nếu cần
        // ...
    }

    /**
     * Update multiplier display
     */
    public updateMultiplier(left: number, right: number): void {
        this.updatePanel({
            multiplierLeft: left,
            multiplierRight: right
        });
    }

    /**
     * Update hands and discards display
     */
    public updateHandsAndDiscards(hands: number, discards: number): void {
        this.updatePanel({
            hands: hands,
            discards: discards
        });
    }

    /**
     * Update money display
     */
    public updateMoney(money: number): void {
        this.updatePanel({
            money: money
        });
    }

    /**
     * Update ante and round display
     */
    public updateAnteAndRound(ante: number, totalAntes: number, round: number): void {
        this.updatePanel({
            ante: ante,
            totalAntes: totalAntes,
            round: round
        });
    }
} 