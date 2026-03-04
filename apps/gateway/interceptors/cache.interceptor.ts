import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  CACHE_MANAGER,
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class SlCacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    console.log('Interceptor', this.cacheManager);
    await this.cacheManager.set('haloo', 1, 6000);

    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest();

    // 1️⃣ Ambil cache key dari @CacheKey decorator
    let key = this.reflector.get<string>(CACHE_KEY_METADATA, handler);

    // fallback key otomatis jika tidak ada decorator
    if (!key) {
      key = `${request.method}:${request.originalUrl}`;
    }

    // 2️⃣ Ambil TTL dari @CacheTTL decorator (detik)
    const ttl = this.reflector.get<number>(CACHE_TTL_METADATA, handler);

    console.log('[SlCacheInterceptor] CACHE KEY =>', key);

    // 3️⃣ Check cache dulu
    const cached = await this.cacheManager.get(key);
    if (cached) {
      console.log('[SlCacheInterceptor] CACHE HIT');
      return of(cached); // return cached value tanpa call handler
    }

    console.log('[SlCacheInterceptor] CACHE MISS');

    // 4️⃣ Jika cache miss, jalankan handler & simpan hasil ke cache
    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      tap(async (response) => {
        try {
          if (ttl) {
            await this.cacheManager.set(key, response, ttl); // TTL number (detik)
          } else {
            await this.cacheManager.set(key, response); // fallback global TTL Keyv
          }
          console.log('[SlCacheInterceptor] CACHE SAVED');
        } catch (err) {
          console.error('[SlCacheInterceptor] Failed to save cache:', err);
        }
      }),
    );
  }
}
