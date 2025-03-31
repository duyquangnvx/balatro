import { Scene } from 'phaser';

export enum ToastType {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success'
}

export interface ToastOptions {
    type?: ToastType;
    duration?: number;
    position?: 'top' | 'middle' | 'bottom';
    fontSize?: string;
}

export class Toast {
    private static instance: Toast;
    private scene: Scene;
    private toasts: Phaser.GameObjects.Container[] = [];
    private readonly defaultOptions: Required<ToastOptions> = {
        type: ToastType.INFO,
        duration: 2000,
        position: 'top',
        fontSize: '20px'
    };

    private readonly typeColors = {
        [ToastType.INFO]: 0x0096FF,
        [ToastType.WARNING]: 0xFFA500,
        [ToastType.ERROR]: 0xFF4440,
        [ToastType.SUCCESS]: 0x32CD32
    };

    private constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * Initialize the singleton instance of Toast
     */
    public static init(scene: Scene): Toast {
        if (!Toast.instance) {
            Toast.instance = new Toast(scene);
        } else {
            Toast.instance.scene = scene;
        }
        return Toast.instance;
    }

    /**
     * Get the current instance of Toast
     */
    public static getInstance(): Toast {
        if (!Toast.instance) {
            throw new Error('Toast has not been initialized. Please call Toast.init(scene) before.');
        }
        return Toast.instance;
    }

    /**
     * Show a toast
     * @param message The message content
     * @param options The display options
     */
    public show(message: string, options?: ToastOptions): void {
        const config = { ...this.defaultOptions, ...options };
        
        // Create container for toast
        const container = this.scene.add.container(0, 0);
        this.toasts.push(container);
        
        // Create background with color based on toast type
        const padding = 20;
        const textStyle = {
            fontSize: config.fontSize,
            color: '#FFFFFF',
            wordWrap: { width: this.scene.cameras.main.width - 100, useAdvancedWrap: true }
        };
        
        // Create text object to calculate size
        const text = this.scene.add.text(0, 0, message, textStyle);
        const textWidth = text.width + padding * 2;
        const textHeight = text.height + padding * 2;
        
        // Create background
        const bg = this.scene.add.rectangle(0, 0, textWidth, textHeight, this.typeColors[config.type]);
        bg.setAlpha(0.9);
        bg.setOrigin(0.5);
        
        // Create official text, centered on the background
        text.setOrigin(0.5);
        
        // Add to container
        container.add([bg, text]);
        
        // Set the position of the container
        const centerX = this.scene.cameras.main.width / 2;
        let posY: number;
        
        switch (config.position) {
            case 'top':
                posY = textHeight / 2 + 20;
                break;
            case 'middle':
                posY = this.scene.cameras.main.height / 2;
                break;
            case 'bottom':
                posY = this.scene.cameras.main.height - textHeight / 2 - 20;
                break;
        }
        
        container.setPosition(centerX, posY);
        container.setAlpha(0);
        
        // Animation to show toast
        this.scene.tweens.add({
            targets: container,
            y: posY + 10,
            alpha: 1,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Timer to hide toast
                this.scene.time.delayedCall(config.duration, () => {
                    this.scene.tweens.add({
                        targets: container,
                        y: posY - 10,
                        alpha: 0,
                        duration: 200,
                        ease: 'Power2',
                        onComplete: () => {
                            container.destroy();
                            const index = this.toasts.indexOf(container);
                            if (index !== -1) {
                                this.toasts.splice(index, 1);
                            }
                        }
                    });
                });
            }
        });
    }
    
    /**
     * Show info toast
     */
    public info(message: string, options?: Omit<ToastOptions, 'type'>): void {
        this.show(message, { ...options, type: ToastType.INFO });
    }
    
    /**
     * Show success toast
     */
    public success(message: string, options?: Omit<ToastOptions, 'type'>): void {
        this.show(message, { ...options, type: ToastType.SUCCESS });
    }
    
    /**
     * Show warning toast
     */
    public warning(message: string, options?: Omit<ToastOptions, 'type'>): void {
        this.show(message, { ...options, type: ToastType.WARNING });
    }
    
    /**
     * Show error toast
     */
    public error(message: string, options?: Omit<ToastOptions, 'type'>): void {
        this.show(message, { ...options, type: ToastType.ERROR });
    }
    
    /**
     * Clear all current toasts
     */
    public clear(): void {
        this.toasts.forEach(toast => toast.destroy());
        this.toasts = [];
    }
} 