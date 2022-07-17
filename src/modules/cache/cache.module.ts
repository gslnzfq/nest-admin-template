import { Module, CacheModule as NestCacheModule, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          ttl: 60 * 60 * 24, // 24h
          max: 100, // 缓存中最大和最小数量
          store: redisStore,
          isGlobal: true, // 全局模块
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
