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
    return this.cache.set(key, value, options);
  }

  /**
   * 删除缓存数据
   * @param key 键值
   */
  async del(key: string) {
    return this.cache.del(key);
  }
}
