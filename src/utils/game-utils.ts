import { Scene } from "phaser";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { THEME_CONFIG } from "../config/theme-config";
import { Button, ButtonConfig as UIButtonConfig } from '../ui/button';

/**
 * Wait for a given number of milliseconds
 * @param ms - The number of milliseconds to wait
 * @returns A promise that resolves after the given number of milliseconds
 */
export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Default game font configuration
 */
export const DEFAULT_FONT = THEME_CONFIG.FONTS.DEFAULT;

/**
 * Text style configuration interface
 */
export interface TextConfig {
    fontSize?: string;
    color?: string;
    align?: string;
    fontStyle?: string;
}

/**
 * BBCode text configuration interface
 */
export interface BBCodeTextConfig {
    fontSize?: string;
    color?: string | number;
    align?: 'left' | 'right' | 'center';
    fixedWidth?: number;
    fixedHeight?: number;
    halign?: 'left' | 'right' | 'center';
    valign?: 'top' | 'bottom' | 'center';
}

/**
 * Label configuration interface
 */
export interface LabelConfig {
    background?: Phaser.GameObjects.GameObject;
    backgroundColor?: number;
    backgroundStrokeColor?: number;
    backgroundStrokeThickness?: number;
    backgroundCornerRadius?: number;
    space?: {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    };
    align?: 'left' | 'right' | 'center';
    width?: number;
    height?: number;
}

/**
 * Button configuration interface
 */
export interface ButtonConfig {
    // Button appearance
    width?: number;
    height?: number;
    backgroundColor?: number;
    backgroundColorOver?: number;
    backgroundColorOut?: number;
    backgroundColorDown?: number;
    backgroundColorDisabled?: number;
    borderRadius?: number;
    
    // Text appearance
    text?: string;
    textSize?: number;
    textColor?: number;
    textColorOver?: number;
    textColorDown?: number;
    textColorDisabled?: number;
    
    // Shadows and effects
    shadowColor?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowAlpha?: number;
    
    // Button state
    disabled?: boolean;
    
    // Spacing
    paddingX?: number;
    paddingY?: number;
    
    // Events
    onClick?: () => void;
    onOver?: () => void;
    onOut?: () => void;
    onDown?: () => void;
}

/**
 * Themed text configuration interface
 */
export interface ThemedTextConfig {
    fontSize?: number;
    color?: number;
    align?: string;
    origin?: {x: number, y: number};
    shadow?: boolean;
    shadowColor?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowAlpha?: number;
}

/**
 * Create text with default game font
 */
export function createText(
    scene: Scene, 
    x: number, 
    y: number, 
    text: string, 
    config: TextConfig = {}
): Phaser.GameObjects.BitmapText {
    const {
        fontSize = '16px',
        color = '#FFFFFF',
        align = 'left'
    } = config;

    // Convert pixel size to font size (remove 'px' and convert to number)
    const size = parseInt(fontSize.replace('px', ''));
    
    const bitmapText = scene.add.bitmapText(x, y, DEFAULT_FONT, text, size);
    bitmapText.setTint(Phaser.Display.Color.HexStringToColor(color).color);
    bitmapText.setOrigin(0.5);
    
    return bitmapText;
}

/**
 * Create BBCode text with default game font
 */
export function createBBCodeText(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    config: BBCodeTextConfig = {}
): UIPlugin.BBCodeText {
    const {
        fontSize = '16px',
        color = '#FFFFFF',
        align = 'left',
        fixedWidth,
        fixedHeight,
        halign = 'left',
        valign = 'top'
    } = config;

    // Đảm bảo các tham số là đúng kiểu
    const bbcodeConfig: any = {
        fontFamily: DEFAULT_FONT,
        fontSize: fontSize,
        color: color,
        align: align
    };

    // Chỉ thêm các thuộc tính khi chúng được định nghĩa
    if (fixedWidth !== undefined) bbcodeConfig.fixedWidth = fixedWidth;
    if (fixedHeight !== undefined) bbcodeConfig.fixedHeight = fixedHeight;
    if (halign !== undefined) bbcodeConfig.halign = halign;
    if (valign !== undefined) bbcodeConfig.valign = valign;

    // Tạo BBCodeText với các tham số đã kiểm tra
    const bbcodeText = scene.rexUI.add.BBCodeText(x, y, text, bbcodeConfig);

    return bbcodeText;
}

/**
 * Create a label with default game font
 */
export function createLabel(
    scene: Scene,
    text: string | number | UIPlugin.BBCodeText | Phaser.GameObjects.GameObject,
    config: LabelConfig = {}
): UIPlugin.Label {
    const {
        background,
        backgroundColor,
        backgroundStrokeColor,
        backgroundStrokeThickness = 0,
        backgroundCornerRadius = 0,
        space = { left: 10, right: 10, top: 5, bottom: 5 },
        align = 'center',
        width,
        height
    } = config;

    // Tạo background nếu không được cung cấp
    let bg = background;
    if (!bg && backgroundColor !== undefined) {
        if (backgroundCornerRadius > 0) {
            bg = scene.rexUI.add.roundRectangle(0, 0, width || 10, height || 10, backgroundCornerRadius, backgroundColor);
        } else {
            bg = scene.add.rectangle(0, 0, width || 10, height || 10, backgroundColor);
        }
        
        // Thêm stroke nếu cần
        if (backgroundStrokeThickness > 0 && backgroundStrokeColor !== undefined) {
            (bg as Phaser.GameObjects.Rectangle).setStrokeStyle(backgroundStrokeThickness, backgroundStrokeColor);
        }
    }

    // Xử lý text
    let textObj: Phaser.GameObjects.GameObject | UIPlugin.BBCodeText;
    
    // Nếu text là string/number, tạo BBCodeText mới
    if (typeof text === 'string' || typeof text === 'number') {
        textObj = createBBCodeText(scene, 0, 0, text.toString(), {
            fontSize: '16px',
            color: '#FFFFFF',
            halign: align
        });
    } else {
        // Đã là GameObject hoặc BBCodeText
        textObj = text;
    }
    
    // Tạo và trả về label
    const label = scene.rexUI.add.label({
        background: bg,
        text: textObj,
        space: space,
        align: align
    });

    return label;
}

/**
 * Create a stylish button using the Button class
 * @param scene Phaser scene
 * @param x X coordinate
 * @param y Y coordinate
 * @param config Button configuration
 * @returns Button instance
 * 
 * @deprecated Sử dụng Button class trực tiếp thay vì gọi qua utility này
 */
export function createThemedButton(
    scene: Scene,
    x: number,
    y: number,
    config: ButtonConfig = {}
): Phaser.GameObjects.Container {
    // Map từ ButtonConfig cũ sang ButtonConfig mới
    const buttonConfig: UIButtonConfig = {
        x: 0,
        y: 0,
        width: config.width,
        height: config.height,
        text: config.text,
        fontSize: config.textSize,
        backgroundColor: config.backgroundColor,
        backgroundColorOver: config.backgroundColorOver,
        backgroundColorOut: config.backgroundColorOut,
        backgroundColorDown: config.backgroundColorDown,
        backgroundColorDisabled: config.backgroundColorDisabled,
        textColor: config.textColor,
        textColorOver: config.textColorOver,
        textColorDown: config.textColorDown,
        textColorDisabled: config.textColorDisabled,
        borderRadius: config.borderRadius,
        disabled: config.disabled,
        onClick: config.onClick,
        onHover: config.onOver,
        onOut: config.onOut,
        onDown: config.onDown
    };
    
    // Tạo button mới sử dụng Button class
    const button = new Button(scene, buttonConfig);
    button.setPosition(x, y);
    
    return button;
}

/**
 * Create text with theme styling
 * @param scene Phaser scene
 * @param x X coordinate
 * @param y Y coordinate
 * @param text Text content
 * @param config Text configuration
 * @returns BitmapText object
 */
export function createThemedText(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    config: ThemedTextConfig = {}
): Phaser.GameObjects.BitmapText {
    const {
        fontSize = THEME_CONFIG.FONTS.SIZES.MEDIUM,
        color = THEME_CONFIG.COLORS.TEXT,
        align = 'left',
        origin = {x: 0, y: 0},
        shadow = false,
        shadowColor = THEME_CONFIG.COLORS.SHADOW,
        shadowOffsetX = THEME_CONFIG.EFFECTS.SHADOW.OFFSET_X,
        shadowOffsetY = THEME_CONFIG.EFFECTS.SHADOW.OFFSET_Y,
        shadowAlpha = THEME_CONFIG.EFFECTS.SHADOW.ALPHA
    } = config;
    
    // Create the main text
    const textObject = scene.add.bitmapText(x, y, THEME_CONFIG.FONTS.DEFAULT, text, fontSize);
    textObject.setOrigin(origin.x, origin.y);
    textObject.setTint(color);
    
    // Add shadow effect if requested
    if (shadow) {
        const shadowText = scene.add.bitmapText(
            x + shadowOffsetX, 
            y + shadowOffsetY, 
            THEME_CONFIG.FONTS.DEFAULT, 
            text, 
            fontSize
        );
        shadowText.setOrigin(origin.x, origin.y);
        shadowText.setTint(shadowColor);
        shadowText.setAlpha(shadowAlpha);
        shadowText.setDepth(textObject.depth - 1);
        
        // Group the text and shadow so they stay together
        const container = scene.add.container(0, 0, [shadowText, textObject]);
        
        // Link the shadow to the main text for easy access
        (textObject as any).shadow = shadowText;
    }
    
    return textObject;
}

/**
 * Create a text label with background
 * @param scene Phaser scene
 * @param x X coordinate
 * @param y Y coordinate
 * @param text Text content
 * @param config Configuration for the label
 * @returns RexUI Label object
 */
export function createThemedLabel(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    config: {
        width?: number;
        height?: number;
        backgroundColor?: number;
        borderRadius?: number;
        fontSize?: number;
        textColor?: number;
        padding?: {
            x?: number;
            y?: number;
        };
    } = {}
): UIPlugin.Label {
    const {
        width = 100,
        height = 40,
        backgroundColor = THEME_CONFIG.UI.PANEL.BACKGROUND,
        borderRadius = THEME_CONFIG.UI.PANEL.BORDER_RADIUS,
        fontSize = THEME_CONFIG.FONTS.SIZES.MEDIUM,
        textColor = THEME_CONFIG.COLORS.TEXT,
        padding = {
            x: THEME_CONFIG.UI.PANEL.PADDING,
            y: THEME_CONFIG.UI.PANEL.PADDING / 2
        }
    } = config;
    
    // Create background
    const background = scene.rexUI.add.roundRectangle(0, 0, width, height, borderRadius, backgroundColor);
    
    // Create text
    const textObject = createThemedText(scene, 0, 0, text, {
        fontSize: fontSize,
        color: textColor,
        align: 'center',
        origin: {x: 0.5, y: 0.5}
    });
    
    // Create label
    const label = scene.rexUI.add.label({
        x,
        y,
        background: background,
        text: textObject,
        space: {
            left: padding.x,
            right: padding.x,
            top: padding.y,
            bottom: padding.y
        },
        align: 'center'
    });
    
    return label;
}
