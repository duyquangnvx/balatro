import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
    private static instance: EventBus;

    private constructor() {
        super();
        // Increase max listeners to avoid memory leak warnings
        this.setMaxListeners(50);
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
        return super.emit(event, ...data);
    }

    /**
     * Subscribe to an event
     * @param event Event name
     * @param listener Event handler
     */
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    /**
     * Subscribe to an event once
     * @param event Event name
     * @param listener Event handler
     */
    public once(event: string, listener: (...args: any[]) => void): this {
        return super.once(event, listener);
    }

    /**
     * Unsubscribe from an event
     * @param event Event name
     * @param listener Event handler
     */
    public off(event: string, listener: (...args: any[]) => void): this {
        return super.off(event, listener);
    }

    /**
     * Remove all listeners for an event or all events
     * @param event Optional event name
     */
    public removeAllListeners(event?: string): this {
        return super.removeAllListeners(event);
    }
}

export default EventBus; 