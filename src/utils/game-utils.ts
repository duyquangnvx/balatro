import { Scene } from "phaser";

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
export const DEFAULT_FONT = 'm6x11plus';

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
