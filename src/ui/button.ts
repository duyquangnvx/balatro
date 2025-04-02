import { Scene } from 'phaser';
import { THEME_CONFIG } from '../config/theme-config';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';

export interface ButtonConfig {
    // Vị trí và kích thước
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    
    // Nội dung
    text?: string;
    fontSize?: number;
    icon?: string; // Texture key for icon
    iconFrame?: string | number; // Frame for icon if using atlas/spritesheet
    
    // Màu sắc
    backgroundColor?: number;
    backgroundColorOver?: number;
    backgroundColorOut?: number;
    backgroundColorDown?: number;
    backgroundColorDisabled?: number;
    textColor?: number;
    textColorOver?: number;
    textColorDown?: number;
    textColorDisabled?: number;
    
    // Hiệu ứng & Hình dạng
    borderRadius?: number;

    // Trạng thái
    disabled?: boolean;
    
    // Padding & Căn chỉnh
    padding?: {
        x?: number;
        y?: number;
    };
    
    // Sự kiện
    onClick?: () => void;
    onHover?: () => void;
    onOut?: () => void;
    onDown?: () => void;
    onUp?: () => void;
}

export class Button extends Phaser.GameObjects.Container {
    // Các phần tử cấu thành button
    private background: UIPlugin.RoundRectangle;
    private textObject: Phaser.GameObjects.BitmapText | null = null;
    private iconObject: Phaser.GameObjects.Image | null = null;
    
    // Cấu hình button
    private config: ButtonConfig;
    
    // Các màu sắc
    private defaultBackgroundColor: number;
    private defaultTextColor: number;
    
    constructor(scene: Scene, config: ButtonConfig = {}) {
        // Khởi tạo container với vị trí mặc định
        super(scene, config.x || 0, config.y || 0);
        
        // Lưu trữ cấu hình với giá trị mặc định
        this.config = {
            width: config.width || 100,
            height: config.height || 40,
            backgroundColor: config.backgroundColor || THEME_CONFIG.UI.BUTTON.BACKGROUND.DEFAULT,
            backgroundColorOver: config.backgroundColorOver || THEME_CONFIG.UI.BUTTON.BACKGROUND.HOVER,
            backgroundColorOut: config.backgroundColorOut || THEME_CONFIG.UI.BUTTON.BACKGROUND.DEFAULT,
            backgroundColorDown: config.backgroundColorDown || THEME_CONFIG.UI.BUTTON.BACKGROUND.HOVER,
            backgroundColorDisabled: config.backgroundColorDisabled || THEME_CONFIG.UI.BUTTON.BACKGROUND.DISABLED,
            borderRadius: config.borderRadius !== undefined ? config.borderRadius : THEME_CONFIG.UI.BUTTON.BORDER_RADIUS,
            
            text: config.text || '',
            fontSize: config.fontSize || THEME_CONFIG.FONTS.SIZES.MEDIUM,
            textColor: config.textColor || THEME_CONFIG.COLORS.TEXT,
            textColorOver: config.textColorOver || THEME_CONFIG.COLORS.TEXT,
            textColorDown: config.textColorDown || THEME_CONFIG.COLORS.TEXT,
            textColorDisabled: config.textColorDisabled || THEME_CONFIG.COLORS.TEXT_SECONDARY,
            
            icon: config.icon,
            iconFrame: config.iconFrame,
            
            disabled: config.disabled || false,
            
            padding: {
                x: config.padding?.x || THEME_CONFIG.UI.BUTTON.PADDING.X,
                y: config.padding?.y || THEME_CONFIG.UI.BUTTON.PADDING.Y
            },
            
            onClick: config.onClick,
            onHover: config.onHover,
            onOut: config.onOut,
            onDown: config.onDown,
            onUp: config.onUp
        };
        
        // Lưu các màu sắc mặc định
        this.defaultBackgroundColor = this.config.backgroundColor!;
        this.defaultTextColor = this.config.textColor!;
        
        // Tạo background
        this.background = scene.rexUI.add.roundRectangle(
            0, 0, 
            this.config.width!, 
            this.config.height!, 
            this.config.borderRadius!, 
            this.config.backgroundColor!
        );
        this.add(this.background);
        
        // Tạo các thành phần còn lại
        this.createContents();
        
        // Thiết lập hiệu ứng tương tác
        this.setupInteractivity();
        
        // Thiết lập initial state
        this.refreshState();
        
        // Thêm vào scene
        scene.add.existing(this);
    }
    
    /**
     * Tạo nội dung bên trong button (text và icon)
     */
    private createContents(): void {
        const { text, icon, iconFrame } = this.config;
        
        // Thêm icon nếu có
        if (icon) {
            this.iconObject = this.scene.add.image(0, 0, icon, iconFrame);
            this.add(this.iconObject);
            
            // Nếu có cả icon và text, cần điều chỉnh vị trí
            if (text) {
                // Đặt icon bên trái text
                this.iconObject.setPosition(-this.config.width! * 0.25, 0);
            }
        }
        
        // Thêm text nếu có
        if (text) {
            this.textObject = this.scene.add.bitmapText(
                0, 0, 
                THEME_CONFIG.FONTS.DEFAULT, 
                text, 
                this.config.fontSize!
            );
            this.textObject.setOrigin(0.5);
            this.textObject.setTint(this.config.textColor!);
            this.add(this.textObject);
            
            // Điều chỉnh vị trí text nếu có icon
            if (icon) {
                this.textObject.setPosition(this.config.width! * 0.1, 0);
            }
        }
    }
    
    /**
     * Thiết lập các hiệu ứng tương tác
     */
    private setupInteractivity(): void {
        // Thiết lập vùng tương tác
        this.setSize(this.config.width!, this.config.height!);
        this.setInteractive({ useHandCursor: true });
        
        // Các sự kiện
        if (!this.config.disabled) {
            this.on('pointerover', this.onPointerOver, this);
            this.on('pointerout', this.onPointerOut, this);
            this.on('pointerdown', this.onPointerDown, this);
            this.on('pointerup', this.onPointerUp, this);
        }
    }
    
    /**
     * Sự kiện khi hover lên button
     */
    private onPointerOver(): void {
        if (this.config.disabled) return;
        
        // this.background.setFillStyle(this.config.backgroundColorOver!);
        // if (this.textObject) {
        //     this.textObject.setTint(this.config.textColorOver!);
        // }
        
        if (this.config.onHover) {
            this.config.onHover();
        }
    }
    
    /**
     * Sự kiện khi rời chuột khỏi button
     */
    private onPointerOut(): void {
        if (this.config.disabled) return;
        
        // this.background.setFillStyle(this.config.backgroundColorOut!);
        // if (this.textObject) {
        //     this.textObject.setTint(this.config.textColor!);
        // }
        
        if (this.config.onOut) {
            this.config.onOut();
        }
    }
    
    /**
     * Sự kiện khi nhấn button
     */
    private onPointerDown(): void {
        if (this.config.disabled) return;
        
        // this.background.setFillStyle(this.config.backgroundColorDown!);
        // if (this.textObject) {
        //     this.textObject.setTint(this.config.textColorDown!);
        // }
        
        if (this.config.onDown) {
            this.config.onDown();
        }
    }
    
    /**
     * Sự kiện khi thả button
     */
    private onPointerUp(): void {
        if (this.config.disabled) return;
        
        // this.background.setFillStyle(this.config.backgroundColorOver!);
        // if (this.textObject) {
        //     this.textObject.setTint(this.config.textColorOver!);
        // }
        
        if (this.config.onUp) {
            this.config.onUp();
        }
        
        if (this.config.onClick) {
            this.config.onClick();
        }
    }
    
    /**
     * Cập nhật trạng thái button
     */
    private refreshState(): void {
        if (this.config.disabled) {
            this.background.setFillStyle(this.config.backgroundColorDisabled!);
            if (this.textObject) {
                this.textObject.setTint(this.config.textColorDisabled!);
            }
            this.disableInteractive();
        } else {
            this.background.setFillStyle(this.defaultBackgroundColor);
            if (this.textObject) {
                this.textObject.setTint(this.defaultTextColor);
            }
            this.setInteractive({ useHandCursor: true });
        }
    }
    
    /**
     * Thiết lập trạng thái kích hoạt/vô hiệu hóa của button
     */
    public setEnabled(enabled: boolean): void {
        if (this.config.disabled === !enabled) return; // Không thay đổi
        
        this.config.disabled = !enabled;
        this.refreshState();
        
        // Thêm/xóa sự kiện tùy thuộc vào trạng thái
        if (enabled) {
            this.on('pointerover', this.onPointerOver, this);
            this.on('pointerout', this.onPointerOut, this);
            this.on('pointerdown', this.onPointerDown, this);
            this.on('pointerup', this.onPointerUp, this);
        } else {
            this.off('pointerover', this.onPointerOver, this);
            this.off('pointerout', this.onPointerOut, this);
            this.off('pointerdown', this.onPointerDown, this);
            this.off('pointerup', this.onPointerUp, this);
        }
    }
    
    /**
     * Thiết lập text của button
     */
    public setText(text: string): void {
        this.config.text = text;
        
        if (this.textObject) {
            this.textObject.setText(text);
        } else if (text) {
            // Tạo mới textObject nếu chưa có
            this.textObject = this.scene.add.bitmapText(
                0, 0, 
                THEME_CONFIG.FONTS.DEFAULT, 
                text, 
                this.config.fontSize!
            );
            this.textObject.setOrigin(0.5);
            this.textObject.setTint(this.config.disabled ? this.config.textColorDisabled! : this.config.textColor!);
            this.add(this.textObject);
        }
    }
    
    /**
     * Thiết lập icon
     */
    public setIcon(key: string, frame?: string | number): void {
        this.config.icon = key;
        this.config.iconFrame = frame;
        
        if (this.iconObject) {
            this.iconObject.setTexture(key, frame);
        } else {
            // Tạo mới iconObject nếu chưa có
            this.iconObject = this.scene.add.image(0, 0, key, frame);
            
            // Điều chỉnh vị trí nếu có text
            if (this.config.text) {
                this.iconObject.setPosition(-this.config.width! * 0.25, 0);
                if (this.textObject) {
                    this.textObject.setPosition(this.config.width! * 0.1, 0);
                }
            }
            
            this.add(this.iconObject);
        }
    }
    
    /**
     * Thiết lập callback khi click
     */
    public setOnClick(callback: () => void): void {
        this.config.onClick = callback;
    }
    
    /**
     * Thay đổi màu nền
     */
    public setBackgroundColor(color: number): void {
        this.config.backgroundColor = color;
        this.defaultBackgroundColor = color;
        
        if (!this.config.disabled) {
            this.background.setFillStyle(color);
        }
    }
} 