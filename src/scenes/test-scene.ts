import { Scene } from 'phaser';

export class TestScene extends Scene {

    constructor() {
        super({ 
            key: 'TestScene'
        });
    }

    create() {
        this.add.text(10, 10, 'REXUI CONTAINER TEST SCENE', { fontSize: '24px', color: '#ffffff' });
        
        // Background cho dễ nhìn
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 
            this.cameras.main.width, this.cameras.main.height, 0x333333);
        
        this.createSizerTest(this.cameras.main.centerX - 400, this.cameras.main.centerY); // Thay thế VBoxTest
        this.createHorizontalSizerTest(this.cameras.main.centerX - 150, this.cameras.main.centerY); // Thay thế HBoxTest
        this.createGridSizerTest(this.cameras.main.centerX + 150, this.cameras.main.centerY); // Thay thế GridTest
        this.createScrollablePanelTest(this.cameras.main.centerX + 400, this.cameras.main.centerY); // Thay thế ScrollTest
        
        // Nút quay lại màn hình chính (nếu cần)
        const backButton = this.add.text(this.cameras.main.width - 100, 30, 'BACK', 
            { fontSize: '18px', color: '#ffffff', backgroundColor: '#ff0000' })
            .setPadding(10)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('GameScene'); // Thay bằng scene chính của game
            });
    }
    
    createSizerTest(x: number, y: number) {
        // Tiêu đề
        this.add.text(x, y - 180, 'Vertical Sizer', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
        
        // Tạo vertical sizer trước
        const container = this.rexUI.add.sizer({
            x, y,
            width: 200,
            height: 400,
            orientation: 'vertical',
            space: { item: 10, top: 20, bottom: 20, left: 20, right: 20 }
        })
        .addBackground(this.add.rectangle(0, 0, 0, 0, 0x666666)
            .setStrokeStyle(2, 0xffffff)
        );
        
        // Sau đó tạo và thêm các mục con trực tiếp vào container
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        const aligns = ['left', 'center', 'right'];
        
        for (let i = 0; i < 5; i++) {
            const label = this.rexUI.add.label({
                width: 150,
                height: 40,
                background: this.add.rectangle(0, 0, 0, 0, colors[i]),
                text: this.add.text(0, 0, `Button ${i+1}`, { fontSize: '16px' }),
                align: aligns[i % 3] as any,
                space: { left: 10, right: 10 }
            });
            container.add(label, 0);
        }
        
        // Tạo align panel trực tiếp và thêm vào container
        const alignPanel = this.rexUI.add.sizer({
            width: 150,
            height: 40,
            orientation: 'horizontal',
            space: { item: 5 }
        });
        
        // Thêm nút điều khiển vào align panel
        ['left', 'center', 'right'].forEach(align => {
            const button = this.add.text(0, 0, align, { fontSize: '12px', backgroundColor: '#555555' })
                .setPadding(5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    // Cho mục đích demo, thay đổi align của toàn bộ panel
                    // Sử dụng các phương thức align có sẵn
                    if (align === 'left') {
                        container.alignLeft(0);
                    } else if (align === 'right') {
                        container.alignRight(0);
                    } else { // center
                        container.alignCenterX(0);
                    }
                    container.layout();
                });
            alignPanel.add(button, 0);
        });
        
        // Thêm align panel vào container chính
        container.add(alignPanel, 0);
        
        // Layout sau khi đã thêm hết các thành phần
        container.layout();
    }
    
    createHorizontalSizerTest(x: number, y: number) {
        // Tiêu đề
        this.add.text(x, y - 180, 'Horizontal Sizer', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
        
        // Tạo horizontal sizer trước
        const container = this.rexUI.add.sizer({
            x, y,
            width: 400,
            height: 200,
            orientation: 'horizontal',
            space: { item: 10, top: 20, bottom: 20, left: 20, right: 20 }
        })
        .addBackground(this.add.rectangle(0, 0, 0, 0, 0x666666)
            .setStrokeStyle(2, 0xffffff)
        );

        // Sau đó tạo và thêm các mục con trực tiếp vào container
        const colors = [0x00ff00, 0x00ff00, 0x00ff00];
        
        for (let i = 0; i < 3; i++) {
            const shape = this.add.rectangle(0, 0, 100, 100, colors[i]);
            container.add(shape, 0);
        }
        
        // Layout container chính sau khi đã thêm tất cả các thành phần
        container.layout();
        
        // Tạo control panel trước
        const controlPanel = this.rexUI.add.sizer({
            x,
            y: y + 150,
            orientation: 'vertical',
            space: { item: 5 }
        })
        .addBackground(this.add.rectangle(0, 0, 0, 0, 0x222222));
        
        // Sau đó tạo và thêm các nút trực tiếp vào control panel
        ['top', 'center', 'bottom'].forEach(align => {
            const button = this.add.text(0, 0, align, { fontSize: '12px', backgroundColor: '#555555' })
                .setPadding(5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    container.layout();
                });
            controlPanel.add(button, 0);
        });
        
        // Layout control panel sau khi đã thêm tất cả các thành phần
        controlPanel.layout();
    }
    
    createGridSizerTest(x: number, y: number) {
        // Tiêu đề
        this.add.text(x, y - 180, 'Grid Sizer', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
        
        // Tạo các mục con
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff, 0xaabbcc];
        
        // Tạo grid sizer
        const container = this.rexUI.add.gridSizer({
            x, y,
            width: 300,
            height: 300,
            column: 3,
            row: 3,
            space: { column: 10, row: 10, top: 20, bottom: 20, left: 20, right: 20 }
        })
        .addBackground(this.add.rectangle(0, 0, 0, 0, 0x666666)
            .setStrokeStyle(2, 0xffffff)
        );
        
        // Thêm các ô vào lưới
        for (let i = 0; i < 8; i++) {
            const cell = this.add.rectangle(0, 0, 60, 60, colors[i]);
            const text = this.add.text(0, 0, `${i+1}`, { fontSize: '16px' }).setOrigin(0.5);
            
            const item = this.rexUI.add.label({
                background: cell,
                text: text,
                space: { left: 0, right: 0, top: 0, bottom: 0 }
            });
            
            const col = i % 3;
            const row = Math.floor(i / 3);
            container.add(item, col, row, 'center', 0, true);
        }
        
        container.layout();
        
        // Thêm nút điều khiển
        const controlPanel = this.rexUI.add.sizer({
            x,
            y: y + 180,
            orientation: 'horizontal',
            space: { item: 5 }
        })
        .addBackground(this.add.rectangle(0, 0, 0, 0, 0x222222));
        
        [2, 3, 4].forEach(cols => {
            const button = this.add.text(0, 0, `${cols} cols`, { fontSize: '12px', backgroundColor: '#555555' })
                .setPadding(5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    // Đổi số cột (trong Rex UI cần tạo lại grid)
                    if (container.columnCount !== cols) {
                        container.columnCount = cols as number;
                        container.layout();
                    }
                });
            controlPanel.add(button, 0);
        });
        
        controlPanel.layout();
    }
    
    createScrollablePanelTest(x: number, y: number) {
        // Tiêu đề
        this.add.text(x, y - 180, 'Scrollable Panel', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
        
        // Tạo nội dung cho panel
        const contentPanel = this.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 10 }
        });
        
        // Thêm nhiều phần tử để làm nội dung dài hơn chiều cao của container
        for (let i = 0; i < 15; i++) {
            const color = i % 2 === 0 ? 0xff5555 : 0x55ff55;
            const item = this.rexUI.add.label({
                width: 180,
                height: 50,
                background: this.add.rectangle(0, 0, 0, 0, color),
                text: this.add.text(0, 0, `Item ${i+1}`, { fontSize: '16px' }),
                align: 'center'
            });
            
            contentPanel.add(item, 0);
        }
        
        // Layout nội dung trước khi thêm vào scrollable panel
        contentPanel.layout();
        
        // Tạo scrollable panel
        const container = this.rexUI.add.scrollablePanel({
            x, y,
            width: 200,
            height: 300,
            
            panel: {
                child: contentPanel,
                mask: {
                    padding: 1,
                }
            },
            
            slider: {
                track: this.add.rectangle(0, 0, 10, 10, 0x444444),
                thumb: this.add.rectangle(0, 0, 10, 10, 0xbbbbbb),
                position: 'right'
            },
            
            space: { left: 10, right: 10, top: 10, bottom: 10, panel: 10 },
            
            background: this.add.rectangle(0, 0, 0, 0, 0x666666)
                .setStrokeStyle(2, 0xffffff),
                
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            }
        });
        
        // Tạo control panel trước
        const controlPanel = this.rexUI.add.sizer({
            x,
            y: y + 180,
            orientation: 'horizontal',
            space: { item: 5 }
        })
        .addBackground(this.add.rectangle(0, 0, 0, 0, 0x222222));
        
        // Nút cuộn lên đầu
        const topButton = this.add.text(0, 0, 'Top', { fontSize: '12px', backgroundColor: '#555555' })
            .setPadding(5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                container.scrollToTop();
            });
        
        // Nút cuộn xuống cuối
        const bottomButton = this.add.text(0, 0, 'Bottom', { fontSize: '12px', backgroundColor: '#555555' })
            .setPadding(5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                container.scrollToBottom();
            });
        
        // Thêm từng nút riêng biệt
        controlPanel.add(topButton, 0);
        controlPanel.add(bottomButton, 0);
        
        // Layout các panel
        controlPanel.layout();
        container.layout();
    }
} 