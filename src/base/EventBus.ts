import EventEmitter from 'eventemitter3';

class EventBus {
    private static instance: EventBus;
    private emitter: EventEmitter;

    private constructor() {
        this.emitter = new EventEmitter();
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * Emit an event with data
     * @param event Event name
     * @param data Event data
     */
    public emit(event: string, ...data: any[]): boolean {
        return this.emitter.emit(event, ...data);
    }

    /**
     * Subscribe to an event
     * @param event Event name
     * @param listener Event handler
     * @param context Context (this) for the listener
     */
    public on(event: string, listener: (...args: any[]) => void, context?: any): this {
        this.emitter.on(event, listener, context);
        return this;
    }

    /**
     * Subscribe to an event once
     * @param event Event name
     * @param listener Event handler
     * @param context Context (this) for the listener
     */
    public once(event: string, listener: (...args: any[]) => void, context?: any): this {
        this.emitter.once(event, listener, context);
        return this;
    }

    /**
     * Unsubscribe from an event
     * @param event Event name
     * @param listener Event handler
     * @param context Context (this) for the listener
     */
    public off(event: string, listener: (...args: any[]) => void, context?: any): this {
        this.emitter.off(event, listener, context);
        return this;
    }

    /**
     * Remove all listeners associated with a specific context
     * @param context - The context whose listeners should be removed
     * @returns EventBus instance for chaining
     */
    targetOff(context: any): this {
        const events = this.emitter.eventNames();
        
        events.forEach(event => {
            const listeners = this.emitter.listeners(event);
            
            listeners.forEach(listener => {
                if ((listener as any).context === context) {
                this.emitter.off(event, listener, context);
                }
            });
        });
        
        return this;
    }

    /**
     * Remove all listeners for an event or all events
     * @param event Optional event name
     */
    public removeAllListeners(event?: string): this {
        this.emitter.removeAllListeners(event);
        return this;
    }

    /**
     * Lấy số lượng listener cho một sự kiện
     * @param event Tên sự kiện
     * @returns Số lượng listener
     */
    public listenerCount(event: string): number {
        return this.emitter.listenerCount(event);
    }
}

export default EventBus; 