import { Controller, Get, Inject, UseInterceptors } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { CacheService } from './cache.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

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

  @Get('cache-add')
  async cache_add() {
    return await this.cacheService.add();
  }

  @UseInterceptors(CacheInterceptor)
  // @CacheKey('transaction_list')
  @CacheKey('{transaction}:list')
  @CacheTTL(600)
  @Get('cache-get')
  async cache_get() {
    return await this.cacheService.get();
  }
}
