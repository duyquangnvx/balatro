import { Scene } from "phaser";
import { PlayingCard } from "../objects/playing-card";
import { PlayingCardDisplay } from "../components/playing-card-display";
import { THEME_CONFIG } from "../config/theme-config";
import { createThemedText, wait } from "./game-utils";


export type AnimationOptions = {
    duration?: number;
    ease?: string;
}

export async function scaleTo(obj: Phaser.GameObjects.GameObject, scaleX: number, scaleY: number, options: AnimationOptions = {}): Promise<void> {
    return new Promise<void>(resolve => {
        obj.scene.tweens.add({
            targets: obj,
            scaleX: scaleX,
            scaleY: scaleY, 
            duration: options.duration,
            ease: options.ease || 'Power2',
            onComplete: () => resolve()
        });
    });
}


export async function fadeTo(obj: Phaser.GameObjects.GameObject, alpha: number, options: AnimationOptions = {}): Promise<void> {
    return new Promise<void>(resolve => {
        obj.scene.tweens.add({
            targets: obj,
            alpha: alpha,
            duration: options.duration,
            ease: options.ease || 'Power2',
            onComplete: () => resolve() 
        });
    });
}

export async function moveTo(obj: Phaser.GameObjects.GameObject, x: number, y: number, options: AnimationOptions = {}): Promise<void> {
    return new Promise<void>(resolve => {
        obj.scene.tweens.add({
            targets: obj,
            x: x,
            y: y,
            duration: options.duration,
            ease: options.ease || 'Power2',
            onComplete: () => resolve()
        });
    });
}   

export async function rotateTo(obj: Phaser.GameObjects.GameObject, angle: number, options: AnimationOptions = {}): Promise<void> {
    return new Promise<void>(resolve => {
        obj.scene.tweens.add({
            targets: obj,
            rotation: angle,
            duration: options.duration,
            ease: options.ease || 'Power2',
            onComplete: () => resolve()
        });
    });
}

/**
 * Create glowing rectangle
 * @param scene Phaser Scene
 * @param x Position x
 * @param y Position y
 * @param width Initial width
 * @param height Initial height
 * @param color Color
 * @returns Created rectangle
 */
export function createGlowingRectangle(
    scene: Scene,
    x: number,
    y: number,
    width: number = 80,
    height: number = 40,
    color: number = THEME_CONFIG.COLORS.BALATRO.BLUE
): Phaser.GameObjects.Rectangle {
    // Create rectangle with a random rotation
    const randomRotation = Phaser.Math.FloatBetween(0, 1);
    
    const rect = scene.add.rectangle(x, y, width, height, color);
    rect.setOrigin(0.5, 0.5);
    rect.setAlpha(0.6);
    rect.setRotation(randomRotation);
    rect.setDepth(990); // Below text score a bit
    
    // Create fade-in and scale-up effect
    scene.tweens.add({
        targets: rect,
        scaleX: 2.5,
        scaleY: 2.5,
        alpha: 0,
        duration: THEME_CONFIG.EFFECTS.ANIMATION.DURATION.SLOW * 4,
        ease: 'Power2',
        onComplete: () => {
            rect.destroy();
        }
    });
    
    return rect;
}

export async function animateScoreText(cardDisplay: PlayingCardDisplay, points: number): Promise<void> {
    const scene = cardDisplay.scene;
    const stringPoints = "+" + points.toString();
    const chars = stringPoints.split('');

    const fontSize = THEME_CONFIG.FONTS.SIZES.LARGE;

    const centerX = cardDisplay.x;
    const startX = centerX - (chars.length * fontSize) / 2 + fontSize / 2;
    const y = cardDisplay.y - (cardDisplay.height / 2 + 70);

    const texts = chars.map((char, index) => {
        const x = startX + index * fontSize;
        const text = createThemedText(scene, x, y, char, {
            fontSize: fontSize,
            color: THEME_CONFIG.COLORS.TEXT
        });

        text.setScale(0);
        text.setOrigin(0.5, 0.5);
        text.setDepth(1000);

        return text;
    });


    createGlowingRectangle(scene, centerX, y, fontSize, fontSize, THEME_CONFIG.COLORS.BALATRO.BLUE);

    for (const text of texts) {
        await scaleTo(text, 1.5, 1.5, { duration: THEME_CONFIG.EFFECTS.ANIMATION.DURATION.FAST, ease: 'Back.Out' });
    }

    await wait(THEME_CONFIG.EFFECTS.ANIMATION.DELAY.LONG);

    for (const text of texts) {
        scaleTo(text, 0, 0, { duration: THEME_CONFIG.EFFECTS.ANIMATION.DURATION.SLOW });
    }
}

