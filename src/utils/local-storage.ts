/**
 * Class for managing localStorage operations with type safety
 * 
 * Example usage:
 * ```
 * // Get singleton instance
 * const storage = LocalStorage.getInstance();
 * 
 * // Save game progress
 * storage.set('gameProgress', { level: 5, score: 1000 });
 * 
 * // Read game progress
 * const progress = storage.get<{ level: number, score: number }>('gameProgress');
 * if (progress) {
 *   console.log(`Level: ${progress.level}, Score: ${progress.score}`);
 * }
 * 
 * // Check if settings exist
 * if (storage.has('settings')) {
 *   // Load settings
 *   const settings = storage.get('settings');
 * }
 * 
 * // Remove a specific save
 * storage.remove('temporarySave');
 * 
 * // Clear all game data
 * storage.clearAll();
 * ```
 */
export class LocalStorage {
    private static instance: LocalStorage;
    private prefix: string;

    /**
     * Private constructor to enforce singleton pattern
     * @param prefix Prefix for all localStorage keys to avoid conflicts
     */
    private constructor(prefix: string = 'balatro_') {
        this.prefix = prefix;
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(prefix?: string): LocalStorage {
        if (!LocalStorage.instance) {
            LocalStorage.instance = new LocalStorage(prefix);
        }
        return LocalStorage.instance;
    }

    /**
     * Set a value in localStorage
     * @param key The key to store the value under
     * @param value The value to store (will be JSON stringified)
     */
    public set<T>(key: string, value: T): void {
        try {
            const prefixedKey = this.getKeyWithPrefix(key);
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(prefixedKey, serializedValue);
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }

    /**
     * Get a value from localStorage
     * @param key The key to retrieve
     * @param defaultValue The default value to return if key doesn't exist
     * @returns The parsed value or defaultValue if not found
     */
    public get<T>(key: string, defaultValue?: T): T | undefined {
        try {
            const prefixedKey = this.getKeyWithPrefix(key);
            const value = localStorage.getItem(prefixedKey);
            
            if (value === null) {
                return defaultValue;
            }
            
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Error getting localStorage key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Check if a key exists in localStorage
     * @param key The key to check
     * @returns True if the key exists, false otherwise
     */
    public has(key: string): boolean {
        const prefixedKey = this.getKeyWithPrefix(key);
        return localStorage.getItem(prefixedKey) !== null;
    }

    /**
     * Remove a value from localStorage
     * @param key The key to remove
     */
    public remove(key: string): void {
        try {
            const prefixedKey = this.getKeyWithPrefix(key);
            localStorage.removeItem(prefixedKey);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }

    /**
     * Clear all localStorage items that start with the prefix
     */
    public clearAll(): void {
        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    /**
     * Get all keys stored in localStorage that start with the prefix
     * @returns Array of keys without the prefix
     */
    public getAllKeys(): string[] {
        const keys: string[] = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key.substring(this.prefix.length));
                }
            }
        } catch (error) {
            console.error('Error getting all localStorage keys:', error);
        }
        return keys;
    }

    /**
     * Add the prefix to a key
     * @param key The key to prefix
     * @returns The prefixed key
     */
    private getKeyWithPrefix(key: string): string {
        return `${this.prefix}${key}`;
    }
} 