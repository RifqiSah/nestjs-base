import {
  Injectable,
  ExecutionContext,
  CanActivate,
  mixin,
  Type,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CacheService } from '../../gateway/src/cache.service';
import { ConfigService } from '@nestjs/config';

export function CustomThrottlerGuard(
  redisPrefixKeyParam: string,
  ttlParam: number,
  limitParam: number,
): Type<CanActivate> {
  @Injectable()
  class ThrottlerGuard implements CanActivate {
    constructor(
      private readonly cacheService: CacheService,
      private readonly configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();
      const msisdn = req?.body?.msisdn;

      const ttl =
        ttlParam || this.configService.get<number>('THROTTLE_TTL', 60000);
      const limit =
        limitParam || this.configService.get<number>('THROTTLE_LIMIT', 1);

      if (!msisdn) {
        throw new BadRequestException('MSISDN is required');
      }

      const redisKey = `${redisPrefixKeyParam}-${msisdn}`;
      const totalRequest = Number(await this.cacheService.getRecord(redisKey));
      console.log('Total Limit:', totalRequest);

      if (!totalRequest) {
        await this.cacheService.setRecord(redisKey, 1, ttl);
        return true;
      }

      if (totalRequest >= limit) {
        throw new HttpException(
          'You have exceeded the maximum number of requests',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      await this.cacheService.setRecord(redisKey, totalRequest + 1, ttl);

      return true;
    }
  }

  return mixin(ThrottlerGuard);
}
