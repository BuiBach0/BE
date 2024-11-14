import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
    constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) { }

    async set(key: string, value: string, ttl: number = 1200): Promise<void> {
        await this.redisClient.set(key, value);
        if (ttl > 0) {
            await this.redisClient.expire(key, ttl);
        }
    }

    async get(key: string): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async ttl(key: string): Promise<number> {
        return await this.redisClient.ttl(key);
    }
}
