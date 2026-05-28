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
    // console.log('Interceptor', this.cacheManager);
    // await this.cacheManager.set('haloo', 1, 6000);

    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest();

    let key = this.reflector.get<string>(CACHE_KEY_METADATA, handler);
    if (!key) {
      key = `${request.method}:${request.originalUrl}`;
    }

    const ttl = this.reflector.get<number>(CACHE_TTL_METADATA, handler);
    console.log('[SlCacheInterceptor] CACHE KEY =>', key);

    const cached = await this.cacheManager.get(key);
    if (cached) {
      console.log('[SlCacheInterceptor] CACHE HIT');
      return of(cached); // return cached value tanpa call handler
    }

    console.log('[SlCacheInterceptor] CACHE MISS');
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
