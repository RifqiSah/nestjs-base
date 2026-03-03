import { CacheInterceptor } from '@nestjs/cache-manager';
import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SlCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const key = super.trackBy(context);
    console.log('[Cache Interceptor] Cache key =>', key);
    return key;
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    console.log('[Cache Interceptor] Intercept start');

    const res$ = await super.intercept(context, next);
    console.log('[Cache Interceptor] Intercept end');

    return res$;
  }
}
