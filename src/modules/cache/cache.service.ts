import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache, CachingConfig } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  /**
   * 获取缓存数据
   * @param key 键值
   */
  async get<T = any>(key: string): Promise<T> {
    return this.cache.get(key);
  }

  /**
   * 存储缓存数据
   * @param key
   * @param value
   * @param options
   */
  async set<T = string>(key: string, value: T, options?: CachingConfig) {
    // 先删除之前的key
    await this.del(key);
    return this.cache.set(key, value, options);
  }

  /**
   * 通过过期时间设置缓存
   * @param key
   * @param value
   * @param expire 过期时间，秒数
   * @param options
   */
  async setUseExpire<T = string>(
    key: string,
    value: T,
    expire: number,
    options?: CachingConfig,
  ) {
    return this.set(key, value, {
      ttl: expire - Math.ceil(new Date().getTime() / 1000),
      ...options,
    });
  }

  /**
   * 删除缓存数据
   * @param key 键值
   */
  async del(key: string) {
    return this.cache.del(key);
  }
}
