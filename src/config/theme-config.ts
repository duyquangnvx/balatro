/**
 * Config default theme for game
 */
export const THEME_CONFIG = {
    // Main colors
    COLORS: {
        PRIMARY: 0x0095F8,          // Blue Balatro
        SECONDARY: 0x273735,        // Dark gray Balatro
        ACCENT: 0xF98B00,           // Yellow Balatro
        BACKGROUND: 0x142227,       // Black Balatro
        TEXT: 0xFFFFFF,             // White
        TEXT_SECONDARY: 0x273735,   // Dark gray Balatro
        SHADOW: 0x000000,           // Black
        ERROR: 0xFF5252,            // Red
        SUCCESS: 0x4CAF50,          // Green
        WARNING: 0xF98B00,          // Yellow
        
        // Special colors of Balatro
        BALATRO: {
            BLUE: 0x0095F8,         // Blue Balatro
            DARK_GRAY: 0x273735,    // Dark gray Balatro
            YELLOW: 0xF98B00,       // Yellow Balatro
            BLACK: 0x142227,        // Black Balatro
            RED: 0xFF5252,          // Red Balatro
            GREEN: 0x296347,        // Green Balatro
        }
    },
    
    // Font settings
    FONTS: {
        DEFAULT: 'm6x11plus',
        PIXEL: 'm6x11plus',
        NORMAL: 'Arial',
        SIZES: {
            TINY: 14,
            SMALL: 18,
            MEDIUM: 24,
            LARGE: 32,
            MEDIUM_LARGE: 36,
            XLARGE: 48
        }
    },
    
    // Hiệu ứng
    EFFECTS: {
        // Default shadow effect
        SHADOW: {
            OFFSET_X: 2,
            OFFSET_Y: 2,
            ALPHA: 0.7
        },
        
        // Default duration for effects
        ANIMATION: {
            DURATION: {
                FAST: 100,
                NORMAL: 200,
                SLOW: 400
            },
            DELAY: {
                SHORT: 100,
                MEDIUM: 200,
                LONG: 500
            },
            LIFT_OFFSET: -30,       // Lift offset of card when selected
            TEXT_FLOAT_OFFSET: -20, // Float offset of text score
        }
    },
    
    // Other UI parameters
    UI: {
        CARD: {
            SPACING: {
                DEFAULT: 10,
                HAND: 20,
                PLAY_AREA: 30
            },
            BORDER_RADIUS: 8,
            SELECTED_TINT: 0xFFFFFF,
            SELECTED_BORDER: 0xF98B00  // Use yellow accent of Balatro
        },
        
        BUTTON: {
            BORDER_RADIUS: 8,
            PADDING: {
                X: 16,
                Y: 8
            },
            BACKGROUND: {
                DEFAULT: 0x0095F8,    // Blue Balatro
                HOVER: 0x00AEFF,      // Lighter blue
                DISABLED: 0x273735    // Dark gray Balatro
            }
        },
        
        PANEL: {
            BACKGROUND: 0x273735,     // Dark gray Balatro
            BORDER_RADIUS: 8,
            PADDING: 16,
            OPACITY: 0.9
        }
    }
}; 