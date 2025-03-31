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
    private backgroundPanel: Phaser.GameObjects.Rectangle;
    private blindTitlePanel: Phaser.GameObjects.Rectangle;
    private blindInfoPanel: Phaser.GameObjects.Rectangle;
    private scorePanel: Phaser.GameObjects.Rectangle;
    private multiplierPanel: Phaser.GameObjects.Rectangle;
    private runInfoButton: Phaser.GameObjects.Container;
    private optionsButton: Phaser.GameObjects.Container;
    private statsPanel: Phaser.GameObjects.Container;

    private titleText: Phaser.GameObjects.Text;
    private targetScoreText: Phaser.GameObjects.Text;
    private currentScoreText: Phaser.GameObjects.Text;
    private multiplierText: Phaser.GameObjects.Text;
    private handsText: Phaser.GameObjects.Text;
    private discardsText: Phaser.GameObjects.Text;
    private moneyText: Phaser.GameObjects.Text;
    private anteText: Phaser.GameObjects.Text;
    private roundText: Phaser.GameObjects.Text;

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
    private readonly darkBlueColor = 0x0A4C82;
    private readonly lightBlueColor = 0x0096FF;
    private readonly darkGrayColor = 0x1D1F21;
    private readonly redColor = 0xFF4440;
    private readonly orangeColor = 0xFF8C00;
    private readonly whiteTextColor = '#FFFFFF';
    private readonly redTextColor = '#FF4440';
    private readonly goldTextColor = '#FFD700';
    private readonly lightBlueTextColor = '#0096FF';
    private readonly orangeTextColor = '#FF8C00';

    constructor(scene: Scene, config: BlindPanelConfig) {
        super(scene, config.x, config.y);
        
        // Create main panel background
        this.backgroundPanel = this.scene.add.rectangle(
            0, 
            0, 
            config.width, 
            config.height, 
            this.darkGrayColor
        );
        this.backgroundPanel.setOrigin(0.5);
        this.backgroundPanel.setStrokeStyle(2, this.lightBlueColor);
        this.add(this.backgroundPanel);
        
        // Create title panel (Small Blind)
        this.blindTitlePanel = this.scene.add.rectangle(
            0,
            -config.height/2 + 25,
            config.width - 20,
            50,
            this.lightBlueColor,
            1
        );
        this.blindTitlePanel.setOrigin(0.5);
        this.blindTitlePanel.setStrokeStyle(1, 0xFFFFFF);
        this.add(this.blindTitlePanel);
        
        // Title text
        this.titleText = this.scene.add.text(
            0,
            -config.height/2 + 25,
            this.displayData.name,
            {
                fontSize: '28px',
                fontStyle: 'bold',
                color: this.whiteTextColor
            }
        );
        this.titleText.setOrigin(0.5);
        this.add(this.titleText);
        
        // Blind info panel (target score, etc)
        this.blindInfoPanel = this.scene.add.rectangle(
            0,
            -config.height/2 + 100,
            config.width - 20,
            100,
            this.darkBlueColor,
            1
        );
        this.blindInfoPanel.setOrigin(0.5);
        this.add(this.blindInfoPanel);
        
        // Create blind icon
        const blindIcon = this.scene.add.circle(
            -config.width/4,
            -config.height/2 + 100,
            30,
            this.darkBlueColor
        );
        blindIcon.setStrokeStyle(2, this.lightBlueColor);
        this.add(blindIcon);
        
        // Blind icon text
        const blindIconText = this.scene.add.text(
            -config.width/4,
            -config.height/2 + 100,
            'SMALL\nBLIND',
            {
                fontSize: '12px',
                fontStyle: 'bold',
                color: this.lightBlueTextColor,
                align: 'center'
            }
        );
        blindIconText.setOrigin(0.5);
        this.add(blindIconText);
        
        // Target score text
        const scoreLabel = this.scene.add.text(
            config.width/8,
            -config.height/2 + 80,
            'Score at least',
            {
                fontSize: '16px',
                color: this.whiteTextColor
            }
        );
        scoreLabel.setOrigin(0.5);
        this.add(scoreLabel);
        
        // Target score value
        this.targetScoreText = this.scene.add.text(
            config.width/8,
            -config.height/2 + 110,
            this.displayData.targetScore.toString(),
            {
                fontSize: '32px',
                fontStyle: 'bold',
                color: this.redTextColor
            }
        );
        this.targetScoreText.setOrigin(0.5);
        this.add(this.targetScoreText);
        
        // Reward text
        const rewardText = this.scene.add.text(
            config.width/8,
            -config.height/2 + 130,
            'Reward: $$$',
            {
                fontSize: '16px',
                color: this.goldTextColor
            }
        );
        rewardText.setOrigin(0.5);
        this.add(rewardText);
        
        // Current score panel
        this.scorePanel = this.scene.add.rectangle(
            0,
            -config.height/2 + 180,
            config.width - 20,
            60,
            this.darkGrayColor,
            1
        );
        this.scorePanel.setOrigin(0.5);
        this.scorePanel.setStrokeStyle(1, 0xFFFFFF);
        this.add(this.scorePanel);
        
        // Round score text
        const roundScoreLabel = this.scene.add.text(
            -config.width/4,
            -config.height/2 + 180,
            'Round\nscore',
            {
                fontSize: '18px',
                color: this.whiteTextColor,
                align: 'center'
            }
        );
        roundScoreLabel.setOrigin(0.5);
        this.add(roundScoreLabel);
        
        // Current score value
        this.currentScoreText = this.scene.add.text(
            config.width/4,
            -config.height/2 + 180,
            this.displayData.currentScore.toString(),
            {
                fontSize: '32px',
                fontStyle: 'bold',
                color: this.whiteTextColor
            }
        );
        this.currentScoreText.setOrigin(0.5);
        this.add(this.currentScoreText);
        
        // Multiplier panel
        this.multiplierPanel = this.scene.add.rectangle(
            0,
            -config.height/2 + 250,
            config.width - 20,
            60,
            this.darkGrayColor,
            1
        );
        this.multiplierPanel.setOrigin(0.5);
        this.add(this.multiplierPanel);
        
        // Left multiplier rectangle
        const leftMultRect = this.scene.add.rectangle(
            -config.width/4,
            -config.height/2 + 250,
            80,
            40,
            this.lightBlueColor
        );
        leftMultRect.setOrigin(0.5);
        this.add(leftMultRect);
        
        // Right multiplier rectangle
        const rightMultRect = this.scene.add.rectangle(
            config.width/4,
            -config.height/2 + 250,
            80,
            40,
            this.redColor
        );
        rightMultRect.setOrigin(0.5);
        this.add(rightMultRect);
        
        // Multiplier text
        this.multiplierText = this.scene.add.text(
            0,
            -config.height/2 + 250,
            `${this.displayData.multiplierLeft} x ${this.displayData.multiplierRight}`,
            {
                fontSize: '28px',
                fontStyle: 'bold',
                color: this.whiteTextColor
            }
        );
        this.multiplierText.setOrigin(0.5);
        this.add(this.multiplierText);
        
        // Create Run Info button
        this.runInfoButton = this.createButton(
            -config.width/4,
            -config.height/2 + 330,
            100,
            80,
            'Run\nInfo',
            this.redColor,
            () => console.log('Run Info clicked')
        );
        this.add(this.runInfoButton);
        
        // Create Options button
        this.optionsButton = this.createButton(
            -config.width/4,
            -config.height/2 + 420,
            100,
            80,
            'Options',
            this.orangeColor,
            () => console.log('Options clicked')
        );
        this.add(this.optionsButton);
        
        // Create stats container
        this.statsPanel = new Phaser.GameObjects.Container(this.scene, config.width/4, -config.height/2 + 370);
        this.add(this.statsPanel);
        
        // Hands and Discards
        const handsBg = this.scene.add.rectangle(
            -30,
            0,
            60,
            50,
            this.darkGrayColor
        );
        handsBg.setStrokeStyle(1, 0xFFFFFF);
        this.statsPanel.add(handsBg);
        
        const discardsBg = this.scene.add.rectangle(
            40,
            0,
            60,
            50,
            this.darkGrayColor
        );
        discardsBg.setStrokeStyle(1, 0xFFFFFF);
        this.statsPanel.add(discardsBg);
        
        const handsLabel = this.scene.add.text(
            -30,
            -15,
            'Hands',
            {
                fontSize: '14px',
                color: this.whiteTextColor
            }
        );
        handsLabel.setOrigin(0.5);
        this.statsPanel.add(handsLabel);
        
        const discardsLabel = this.scene.add.text(
            40,
            -15,
            'Discards',
            {
                fontSize: '14px',
                color: this.whiteTextColor
            }
        );
        discardsLabel.setOrigin(0.5);
        this.statsPanel.add(discardsLabel);
        
        this.handsText = this.scene.add.text(
            -30,
            10,
            this.displayData.hands.toString(),
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: this.lightBlueTextColor
            }
        );
        this.handsText.setOrigin(0.5);
        this.statsPanel.add(this.handsText);
        
        this.discardsText = this.scene.add.text(
            40,
            10,
            this.displayData.discards.toString(),
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: this.lightBlueTextColor
            }
        );
        this.discardsText.setOrigin(0.5);
        this.statsPanel.add(this.discardsText);
        
        // Money display
        const moneyBg = this.scene.add.rectangle(
            0,
            50,
            130,
            50,
            this.darkGrayColor
        );
        moneyBg.setStrokeStyle(1, 0xFFFFFF);
        this.statsPanel.add(moneyBg);
        
        this.moneyText = this.scene.add.text(
            0,
            50,
            '$' + this.displayData.money,
            {
                fontSize: '28px',
                fontStyle: 'bold',
                color: this.goldTextColor
            }
        );
        this.moneyText.setOrigin(0.5);
        this.statsPanel.add(this.moneyText);
        
        // Ante and Round
        const anteBg = this.scene.add.rectangle(
            -30,
            100,
            60,
            50,
            this.darkGrayColor
        );
        anteBg.setStrokeStyle(1, 0xFFFFFF);
        this.statsPanel.add(anteBg);
        
        const roundBg = this.scene.add.rectangle(
            40,
            100,
            60,
            50,
            this.darkGrayColor
        );
        roundBg.setStrokeStyle(1, 0xFFFFFF);
        this.statsPanel.add(roundBg);
        
        const anteLabel = this.scene.add.text(
            -30,
            85,
            'Ante',
            {
                fontSize: '14px',
                color: this.whiteTextColor
            }
        );
        anteLabel.setOrigin(0.5);
        this.statsPanel.add(anteLabel);
        
        const roundLabel = this.scene.add.text(
            40,
            85,
            'Round',
            {
                fontSize: '14px',
                color: this.whiteTextColor
            }
        );
        roundLabel.setOrigin(0.5);
        this.statsPanel.add(roundLabel);
        
        this.anteText = this.scene.add.text(
            -30,
            110,
            `${this.displayData.ante}/${this.displayData.totalAntes}`,
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: this.orangeTextColor
            }
        );
        this.anteText.setOrigin(0.5);
        this.statsPanel.add(this.anteText);
        
        this.roundText = this.scene.add.text(
            40,
            110,
            this.displayData.round.toString(),
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: this.whiteTextColor
            }
        );
        this.roundText.setOrigin(0.5);
        this.statsPanel.add(this.roundText);
        
        scene.add.existing(this);
    }
    
    private createButton(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        color: number,
        callback?: () => void
    ): Phaser.GameObjects.Container {
        const container = new Phaser.GameObjects.Container(this.scene, x, y);
        
        // Create button background
        const bg = this.scene.add.rectangle(0, 0, width, height, color);
        bg.setOrigin(0.5);
        container.add(bg);
        
        // Create button text
        const buttonText = this.scene.add.text(0, 0, text, {
            fontSize: '20px',
            color: this.whiteTextColor,
            align: 'center'
        });
        buttonText.setOrigin(0.5);
        container.add(buttonText);
        
        // Make button interactive
        bg.setInteractive({ useHandCursor: true });
        if (callback) {
            bg.on('pointerdown', callback);
        }
        
        return container;
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