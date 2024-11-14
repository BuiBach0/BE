import { forwardRef, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        ConfigModule,
    ],
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: async () => {
                const redis = new Redis({
                    host: 'localhost',
                    port: 6379
                });
                return redis;
            },
        },
        RedisService,
    ],
    exports: [RedisService],
})
export class RedisModule { }
