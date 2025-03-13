/**
 * AssetManager - Manages all game assets with consistent keys and paths
 */
export class AssetManager {
    // Base paths
    private static readonly BASE_PATH = 'assets/';
    private static readonly ATLAS_PATH = `${AssetManager.BASE_PATH}atlas/`;
    
    // Asset types - using filenames as values
    public static readonly ATLAS = {
        DECK: 'Deck',
        CARDS: 'Cards',
        ENHANCERS: 'Enhancers'
    };
    
    public static readonly IMAGES = {
        BACKGROUND: 'bg',
        LOGO: 'logo'
    };
    
    /**
     * Preload all game assets
     * @param loader Phaser loader instance
     */
    public static preloadAll(loader: Phaser.Loader.LoaderPlugin): void {
        this.preloadImages(loader);
        this.preloadAtlases(loader);
    }
    
    /**
     * Preload all image assets
     * @param loader Phaser loader instance
     */
    private static preloadImages(loader: Phaser.Loader.LoaderPlugin): void {
        // Load all images defined in IMAGES
        Object.entries(this.IMAGES).forEach(([key, filename]) => {
            loader.image(filename, `${this.BASE_PATH}${filename}.png`);
        });
    }
    
    /**
     * Preload all atlas assets
     * @param loader Phaser loader instance
     */
    private static preloadAtlases(loader: Phaser.Loader.LoaderPlugin): void {
        // Load all atlases defined in ATLAS
        Object.entries(this.ATLAS).forEach(([key, filename]) => {
            loader.atlas(
                filename,
                `${this.ATLAS_PATH}${filename}.png`,
                `${this.ATLAS_PATH}${filename}.json`
            );
        });
    }

} 