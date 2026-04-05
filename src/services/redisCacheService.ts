import Redis from "ioredis";

export class RedisCacheService {
    private readonly client: Redis;

    constructor(redisUrl: string) {
        this.client = new Redis(redisUrl, {
            lazyConnect: true,
        });

        this.client.on("error", (err) => {
            console.error("Redis client error:", err);
        });
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        if (value === null) return null;
        return JSON.parse(value) as T;
    }

    async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
        await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }
}
