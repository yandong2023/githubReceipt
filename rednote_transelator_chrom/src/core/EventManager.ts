type EventCallback = (data: any) => void;

export class EventManager {
    private static instance: EventManager;
    private subscribers: Map<string, EventCallback[]>;

    private constructor() {
        this.subscribers = new Map();
    }

    public static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }

    public subscribe(event: string, callback: EventCallback): () => void {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }

        const callbacks = this.subscribers.get(event);
        callbacks.push(callback);

        // 返回取消订阅函数
        return () => {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    public emit(event: string, data?: any): void {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    public removeAllSubscribers(event?: string): void {
        if (event) {
            this.subscribers.delete(event);
        } else {
            this.subscribers.clear();
        }
    }
} 