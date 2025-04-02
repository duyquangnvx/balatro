import { Scene } from 'phaser';
import { THEME_CONFIG } from '../config/theme-config';

export interface RoundedContainerConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
    backgroundColor?: number;
    borderColor?: number;
    borderWidth?: number;
    alpha?: number;
    padding?: {
        x?: number;
        y?: number;
    };
}

/**
 * Container với nền là rounded rectangle
 * Giúp đơn giản hóa việc tạo các thành phần UI có background bo tròn góc
 */
export class RoundedContainer extends Phaser.GameObjects.Container {
    private backgroundRect: Phaser.GameObjects.GameObject;
    private borderRect: Phaser.GameObjects.GameObject | null = null;
    private _width: number;
    private _height: number;
    private _radius: number;
    private _backgroundColor: number;
    private _borderColor: number | null;
    private _borderWidth: number;
    private _padding: { x: number; y: number };

    constructor(scene: Scene, config: RoundedContainerConfig) {
        super(scene, config.x, config.y);

        // Lưu trữ các thuộc tính
        this._width = config.width;
        this._height = config.height;
        this._radius = config.radius || THEME_CONFIG.UI.PANEL.BORDER_RADIUS;
        this._backgroundColor = config.backgroundColor !== undefined ? config.backgroundColor : THEME_CONFIG.UI.PANEL.BACKGROUND;
        this._borderColor = config.borderColor !== undefined ? config.borderColor : null;
        this._borderWidth = config.borderWidth || 2;
        this._padding = {
            x: config.padding?.x || THEME_CONFIG.UI.PANEL.PADDING,
            y: config.padding?.y || THEME_CONFIG.UI.PANEL.PADDING
        };

        // Tạo border nếu có
        if (this._borderColor !== null) {
            this.borderRect = scene.rexUI.add.roundRectangle(
                0, 0, 
                this._width + this._borderWidth * 2, 
                this._height + this._borderWidth * 2, 
                this._radius + this._borderWidth, 
                this._borderColor
            );
            this.add(this.borderRect);
        }

        // Tạo background
        this.backgroundRect = scene.rexUI.add.roundRectangle(
            0, 0, this._width, this._height, this._radius, this._backgroundColor
        );
        this.add(this.backgroundRect);

        // Thiết lập alpha nếu được chỉ định
        if (config.alpha !== undefined) {
            this.setAlpha(config.alpha);
        }

        // Thêm vào scene
        scene.add.existing(this);
    }

    /**
     * Thêm game object vào container và điều chỉnh vị trí theo padding
     */
    public addContent(gameObject: Phaser.GameObjects.GameObject): this {
        // Đã có trong phương thức add gốc
        this.add(gameObject);
        return this;
    }

    /**
     * Đặt background color mới
     */
    public setBackgroundColor(color: number): this {
        this._backgroundColor = color;
        (this.backgroundRect as any).setFillStyle(color);
        return this;
    }

    /**
     * Đặt viền mới
     */
    public setBorder(color: number, width: number = this._borderWidth): this {
        this._borderColor = color;
        this._borderWidth = width;

        // Xóa viền cũ nếu có
        if (this.borderRect) {
            this.remove(this.borderRect, true);
            this.borderRect = null;
        }

        // Tạo viền mới
        this.borderRect = this.scene.rexUI.add.roundRectangle(
            0, 0, 
            this._width + this._borderWidth * 2, 
            this._height + this._borderWidth * 2, 
            this._radius + this._borderWidth, 
            color
        );
        
        // Thêm viền vào vị trí đầu tiên để nó nằm dưới các phần tử khác
        this.addAt(this.borderRect, 0);
        
        return this;
    }

    /**
     * Xóa viền
     */
    public removeBorder(): this {
        if (this.borderRect) {
            this.remove(this.borderRect, true);
            this.borderRect = null;
            this._borderColor = null;
        }
        return this;
    }

    /**
     * Thay đổi kích thước container
     */
    public resize(width: number, height: number): this {
        this._width = width;
        this._height = height;

        // Cập nhật kích thước background
        (this.backgroundRect as any).setSize(width, height);

        // Cập nhật kích thước border nếu có
        if (this.borderRect) {
            (this.borderRect as any).setSize(
                width + this._borderWidth * 2, 
                height + this._borderWidth * 2
            );
        }

        return this;
    }

    /**
     * Thay đổi độ bo tròn góc
     */
    public setRadius(radius: number): this {
        this._radius = radius;
        
        // Cập nhật radius của background
        (this.backgroundRect as any).setRadius(radius);
        
        // Cập nhật radius của border nếu có
        if (this.borderRect) {
            (this.borderRect as any).setRadius(radius + this._borderWidth);
        }
        
        return this;
    }

    /**
     * Lấy chiều rộng thực của container tính cả padding
     */
    public get contentWidth(): number {
        return this._width - this._padding.x * 2;
    }

    /**
     * Lấy chiều cao thực của container tính cả padding
     */
    public get contentHeight(): number {
        return this._height - this._padding.y * 2;
    }

    /**
     * Lấy padding hiện tại
     */
    public get padding(): { x: number; y: number } {
        return { ...this._padding };
    }

    /**
     * Thay đổi padding
     */
    public setPadding(paddingX: number, paddingY: number = paddingX): this {
        this._padding.x = paddingX;
        this._padding.y = paddingY;
        return this;
    }
    
    /**
     * Thêm nhiều game object vào container cùng lúc
     */
    public addContents(gameObjects: Phaser.GameObjects.GameObject[]): this {
        gameObjects.forEach(obj => this.add(obj));
        return this;
    }
    
    /**
     * Xóa tất cả nội dung nhưng giữ lại background và border
     */
    public clearContents(): this {
        const children = [...this.getAll()];
        
        // Lưu lại background và border
        const background = this.backgroundRect;
        const border = this.borderRect;
        
        // Xóa tất cả trừ background và border
        children.forEach(child => {
            if (child !== background && child !== border) {
                this.remove(child);
            }
        });
        
        return this;
    }
} 