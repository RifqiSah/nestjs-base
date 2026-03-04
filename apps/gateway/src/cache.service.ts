import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private redis: any;

  private transactions = [
    { id: 1, amount: 100 },
    { id: 2, amount: 200 },
  ];

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    // console.log('Service', this.cacheManager);

    const stores = (this.cacheManager as any).stores;
    const redisStore = stores[0];

    this.redis =
      redisStore.redis ?? redisStore.client ?? redisStore.getClient?.();
  }

  private async pushToCache(newData: { id: number; amount: number }) {
    // get from cache first
    const cached: any = await this.cacheManager.get('transaction_list');
    if (cached) {
      cached.data.push(newData);

      // set new data
      await this.cacheManager.set('transaction_list', cached);
      console.log('Cache updated!');
    }
  }

  async add() {
    const newData = {
      id: this.transactions.length + 1,
      amount: Math.floor(Math.random() * 1000),
    };

    this.transactions.push(newData); // push / save to database
    await this.pushToCache(newData); // push to cache

    return newData;
  }

  async get() {
    await this.cacheManager.set('testing-rifqi-1', 1);
    console.log('val 1:', await this.cacheManager.get('testing-rifqi-1'));

    await this.cacheManager.set('testing-rifqi-2', 2);
    console.log('val 2:', await this.cacheManager.get('testing-rifqi-2'));

    console.log('Get function called!');
    return {
      data: this.transactions,
    };
  }
}
