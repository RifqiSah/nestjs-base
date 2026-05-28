import {
  Controller,
  Get,
  Inject,
  Post,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { CacheService } from './cache.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { SlCacheInterceptor } from '../interceptors/cache.interceptor';
import { CustomThrottlerGuard } from 'apps/common/guards/custom-throttler.guard';

@Controller()
export class GatewayController {
  constructor(
    @Inject(GatewayService)
    private readonly gatewayService: GatewayService,

    @Inject(CacheService)
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  async getHello() {
    return await this.gatewayService.getHello();
  }

  @UseGuards(CustomThrottlerGuard('prefix-key', 30000, 2))
  @Post('cache-add')
  async cache_add_post() {
    return await this.cacheService.add();
  }

  @Get('cache-add')
  async cache_add() {
    return await this.cacheService.add();
  }

  // @UseInterceptors(SlCacheInterceptor)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(10 * 60 * 60 * 1000)
  @CacheKey('transaction_list')
  @Get('cache-get')
  async cache_get() {
    return await this.cacheService.get();
  }
}
