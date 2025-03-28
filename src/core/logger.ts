export class Logger {
    private static isDebugEnabled: boolean = false;

    private constructor() {
        // Prevent instantiation
        throw new Error('Logger is a static class and cannot be instantiated');
    }

    public static enableDebug(): void {
        Logger.isDebugEnabled = true;
    }

    public static disableDebug(): void {
        Logger.isDebugEnabled = false;
    }

    public static info(message: string, ...args: any[]): void {
        console.log(`[INFO] ${message}`, ...args);
    }

    public static error(message: string, ...args: any[]): void {
        console.error(`[ERROR] ${message}`, ...args);
    }

    public static warn(message: string, ...args: any[]): void {
        console.warn(`[WARN] ${message}`, ...args);
    }

    public static debug(message: string, ...args: any[]): void {
        if (Logger.isDebugEnabled) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
}
