import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { Scene } from 'phaser';
import { BlindType } from '../config/game-config';

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
    private readonly darkGrayColor = 0x273935;
    private readonly redColor = 0xFF4440;
    private readonly orangeColor = '#FF8C00';
    private readonly whiteTextColor = '#FFFFFF';
    private readonly goldColor = '#FFD700';
    private readonly lightBlueTextColor = '#0096FF';

    // Font family
    private readonly fontFamily = 'm6x11plus';

    constructor(scene: Scene, config: BlindPanelConfig) {
        super(scene, config.x, config.y);
        
        this.createMainPanel(config);
        
        scene.add.existing(this);
    }
    
    private createMainPanel(config: BlindPanelConfig): void {
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
        this.titleText = this.scene.rexUI.add.BBCodeText(0, 0, this.displayData.name, {
            fontFamily: this.fontFamily,
            fontSize: '24px',
            color: this.whiteTextColor,
            fixedWidth: config.width,
            fixedHeight: 50,
            halign: 'center',
            valign: 'center'
        });
        
        const titleLabel = this.scene.rexUI.add.label({
            background: this.scene.add.rectangle(0, 0, 0, 0, this.lightBlueColor),
            text: this.titleText,
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
        
        // Sau đó tạo blind icon và thêm vào
        const blindIcon = this.scene.rexUI.add.roundRectangle(0, 0, 80, 80, 40, 0x2139A1) as any;
        blindIcon.setStrokeStyle(2, this.lightBlueColor);
        
        const blindIconText = this.scene.rexUI.add.BBCodeText(0, 0, 'SMALL\nBLIND', {
            fontFamily: this.fontFamily,
            fontSize: '14px',
            color: this.whiteTextColor,
            align: 'center',
            fixedWidth: 70,
            fixedHeight: 70,
            halign: 'center',
            valign: 'center'
        });
        
        const blindIconLabel = this.scene.rexUI.add.label({
            background: blindIcon,
            text: blindIconText,
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
        const scoreLabel = this.scene.rexUI.add.BBCodeText(0, 0, 'Score at least', {
            fontFamily: this.fontFamily,
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
        
        this.targetScoreText = this.scene.rexUI.add.BBCodeText(0, 0, this.displayData.targetScore.toString(), {
            fontFamily: this.fontFamily,
            fontSize: '30px',
            color: '#FF4440'
        });
        
        scoreRow.add(chipIcon, 0, 'center', 0, false)
               .add(this.targetScoreText, 0, 'center', 0, false);
        
        // Layout score row
        (scoreRow as any).layout();
        
        const rewardText = this.scene.rexUI.add.BBCodeText(0, 0, 'Reward: $$$', {
            fontFamily: this.fontFamily,
            fontSize: '16px',
            color: this.goldColor
        });
        
        // Thêm vào panel
        targetScorePanel
            .add(scoreLabel, 0, 'center', 0, false)
            .add(scoreRow, 0, 'center', 0, false)
            .add(rewardText, 0, 'center', 0, false);
        
        // Layout target score panel
        (targetScorePanel as any).layout();
        
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
        const scoreLabel = this.scene.rexUI.add.BBCodeText(0, 0, 'Round\nscore', {
            fontFamily: this.fontFamily,
            fontSize: '18px',
            color: this.whiteTextColor,
            align: 'center'
        });
        
        // Tạo sizer con trước
        const scoreContentSizer = this.scene.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 10 }
        });
        
        // Sau đó tạo và thêm chip icon và score text
        const chipIcon = this.scene.add.sprite(0, 0, 'chips', 'white.png');
        chipIcon.setScale(0.4);
        
        this.currentScoreText = this.scene.rexUI.add.BBCodeText(0, 0, this.displayData.currentScore.toString(), {
            fontFamily: this.fontFamily,
            fontSize: '32px',
            color: this.whiteTextColor
        });
        
        scoreContentSizer
            .add(chipIcon, 0, 'center', 0, false)
            .add(this.currentScoreText, 0, 'center', 0, false);
        
        // Layout score content sizer
        (scoreContentSizer as any).layout();
        
        // Thêm vào panel chính
        scorePanel
            .add(scoreLabel, 0, 'center', 0, false)
            .add(scoreContentSizer, 1, 'center', 0, false);
        
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
            space: { item: 20, left: 20, right: 20 }
        })
        .addBackground(this.scene.add.rectangle(0, 0, 0, 0, this.darkGrayColor)
            .setStrokeStyle(1, 0xFFFFFF));
        
        // Sau đó tạo và thêm các đối tượng con
        const leftMultRect = this.scene.add.rectangle(0, 0, 80, 40, this.lightBlueColor);
        
        this.multiplierText = this.scene.rexUI.add.BBCodeText(0, 0, 
            `${this.displayData.multiplierLeft} x ${this.displayData.multiplierRight}`, {
            fontFamily: this.fontFamily,
            fontSize: '32px',
            color: this.whiteTextColor
        });
        
        const rightMultRect = this.scene.add.rectangle(0, 0, 80, 40, this.redColor);
        
        // Thêm vào panel
        multiplierPanel
            .add(leftMultRect, 0, 'center', 0, false)
            .add(this.multiplierText, 0, 'center', 0, false)
            .add(rightMultRect, 0, 'center', 0, false);
        
        // Layout multiplier panel
        multiplierPanel.layout();
        
        return multiplierPanel;
    }

    private createButtonsAndStats(width: number): UIPlugin.Sizer {
        // Tạo bottom panel trước
        const bottomPanel = this.scene.rexUI.add.sizer({
            orientation: 'horizontal',
            width: width,
            height: 200,
            space: { item: 20 }
        });
        
        // Tạo buttons sizer
        const buttonsSizer = this.scene.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 10 }
        });
        
        // Tạo và thêm các button
        const runInfoButton = this.createButton(
            'Run\nInfo',
            this.redColor,
            () => console.log('Run Info clicked')
        );
        
        const optionsButton = this.createButton(
            'Options',
            this.lightBlueColor,
            () => console.log('Options clicked')
        );
        
        buttonsSizer
            .add(runInfoButton, 0, 'center', 0, false)
            .add(optionsButton, 0, 'center', 0, false);
        
        // Layout buttons sizer
        (buttonsSizer as any).layout();
        
        // Tạo stats grid
        const statsGridSizer = this.scene.rexUI.add.gridSizer({
            column: 2,
            row: 3,
            width: width - 120,
            height: 200,
            space: { column: 10, row: 10 }
        });
        
        // Tạo stats items
        const [handsLabel, handsValue] = this.createStatsItem('Hands', this.displayData.hands, this.lightBlueTextColor);
        const [discardsLabel, discardsValue] = this.createStatsItem('Discards', this.displayData.discards, this.lightBlueTextColor);
        const [moneyLabel, moneyValue] = this.createStatsItem('Money', this.displayData.money, this.goldColor, true);
        const [anteLabel, anteValue] = this.createStatsItem(
            'Ante', 
            `${this.displayData.ante}/${this.displayData.totalAntes}`, 
            this.orangeColor
        );
        const [roundLabel, roundValue] = this.createStatsItem('Round', this.displayData.round, this.whiteTextColor);
        
        // Store references to text elements
        this.handsText = handsValue;
        this.discardsText = discardsValue;
        this.moneyText = moneyValue;
        this.anteText = anteValue;
        this.roundText = roundValue;
        
        // Thêm vào grid
        statsGridSizer
            .add(handsLabel, 0, 0, 'center', 0, true)
            .add(discardsLabel, 1, 0, 'center', 0, true)
            .add(moneyLabel, 0, 1, 'center', 0, true)
            .add(anteLabel, 1, 1, 'center', 0, true)
            .add(roundLabel, 0, 2, 'center', 0, true);
        
        // Layout stats grid sizer
        (statsGridSizer as any).layout();
        
        // Thêm vào bottom panel
        bottomPanel
            .add(buttonsSizer, 0, 'top', 0, false)
            .add(statsGridSizer, 1, 'center', 0, true);
        
        // Layout bottom panel
        bottomPanel.layout();
        
        return bottomPanel;
    }

    private createButton(
        text: string,
        color: number,
        callback?: () => void
    ): UIPlugin.Label {
        // Sử dụng RexUI buttons với font pixelated
        const background = this.scene.rexUI.add.roundRectangle(0, 0, 100, 80, 10, color);
        
        const button = this.scene.rexUI.add.label({
            background: background,
            text: this.scene.rexUI.add.BBCodeText(0, 0, text, {
                fontFamily: this.fontFamily,
                fontSize: '20px',
                color: this.whiteTextColor,
                align: 'center',
                fixedWidth: 90,
                fixedHeight: 70,
                halign: 'center',
                valign: 'center'
            }),
            space: { left: 10, right: 10, top: 10, bottom: 10 },
        });
        
        button.setInteractive()
            .on('pointerover', () => {
                background.fillColor = Phaser.Display.Color.ValueToColor(color).brighten(20).color;
            })
            .on('pointerout', () => {
                background.fillColor = color;
            })
            .on('pointerdown', () => {
                background.fillColor = Phaser.Display.Color.ValueToColor(color).darken(20).color;
                if (callback) callback();
            })
            .on('pointerup', () => {
                background.fillColor = color;
            });
        
        return button;
    }

    private createStatsItem(
        label: string, 
        value: string | number, 
        color: string,
        isMoney: boolean = false
    ): [UIPlugin.Container, UIPlugin.BBCodeText] {
        // Tạo stats container trước
        const statsItem = this.scene.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 5 }
        })
        .addBackground(this.scene.add.rectangle(0, 0, 0, 0, 0x222222)
            .setStrokeStyle(1, 0x333333));
        
        // Sau đó tạo và thêm các đối tượng con
        const labelText = this.scene.rexUI.add.BBCodeText(0, 0, label, {
            fontFamily: this.fontFamily,
            fontSize: '14px',
            color: this.whiteTextColor
        });
        
        const valueText = this.scene.rexUI.add.BBCodeText(0, 0, 
            isMoney ? '$' + value : value.toString(), {
            fontFamily: this.fontFamily,
            fontSize: '24px',
            color: color
        });
        
        statsItem
            .add(labelText, 0, 'center', 0, false)
            .add(valueText, 0, 'center', 0, false);
        
        // Layout stats item
        (statsItem as any).layout();
        
        return [statsItem, valueText];
    }

    /**
     * Update the panel with new display data
     */
    public updatePanel(data: Partial<BlindDisplayData>): void {
        // Update the display data
        this.displayData = { ...this.displayData, ...data };
        
        // Update text elements
        this.titleText.setText(this.displayData.name);
        
        this.targetScoreText.setText(this.displayData.targetScore.toString());
        this.currentScoreText.setText(this.displayData.currentScore.toString());
        this.multiplierText.setText(`${this.displayData.multiplierLeft} x ${this.displayData.multiplierRight}`);
        this.handsText.setText(this.displayData.hands.toString());
        this.discardsText.setText(this.displayData.discards.toString());
        this.moneyText.setText('$' + this.displayData.money);
        this.anteText.setText(`${this.displayData.ante}/${this.displayData.totalAntes}`);
        this.roundText.setText(this.displayData.round.toString());
        
        // Re-layout the panel
        this.layoutAll();
    }
    
    /**
     * Layout all UI components
     */
    public layoutAll(): void {
        // Tìm tất cả các sizer con trong mainPanel và gọi layout
        if (this.mainPanel) {
            // Layout main panel
            this.mainPanel.layout();
        }
    }
    
    /**
     * Update the current score
     */
    public updateScore(score: number): void {
        this.displayData.currentScore = score;
        this.currentScoreText.setText(score.toString());
    }
    
    /**
     * Update the current blind
     */
    public updateBlind(blindType: BlindType, name: string, targetScore: number): void {
        this.displayData.name = name;
        this.displayData.targetScore = targetScore;
        
        // Cập nhật title text trực tiếp
        this.titleText.setText(name);
        
        this.targetScoreText.setText(targetScore.toString());
    }
    
    /**
     * Update the multiplier display
     */
    public updateMultiplier(left: number, right: number): void {
        this.displayData.multiplierLeft = left;
        this.displayData.multiplierRight = right;
        this.multiplierText.setText(`${left} x ${right}`);
    }
    
    /**
     * Update hands and discards
     */
    public updateHandsAndDiscards(hands: number, discards: number): void {
        this.displayData.hands = hands;
        this.displayData.discards = discards;
        this.handsText.setText(hands.toString());
        this.discardsText.setText(discards.toString());
    }
    
    /**
     * Update money
     */
    public updateMoney(money: number): void {
        this.displayData.money = money;
        this.moneyText.setText('$' + money);
    }
    
    /**
     * Update ante and round
     */
    public updateAnteAndRound(ante: number, totalAntes: number, round: number): void {
        this.displayData.ante = ante;
        this.displayData.totalAntes = totalAntes;
        this.displayData.round = round;
        this.anteText.setText(`${ante}/${totalAntes}`);
        this.roundText.setText(round.toString());
    }
} 