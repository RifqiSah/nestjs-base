import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import redisConfig from 'apps/config/redis.config';
import {
  createGeneralRedisCluster,
  createBullRedisCluster,
} from 'apps/utils/redis/redis-cluster.provider';
import postgresConfig from 'apps/configs/postgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keyword } from '../entities/keyword.entity';
import { CacheService } from './cache.service';
import { Cluster } from 'ioredis';

function redisClusterStore(redis: Cluster) {
  return {
    isCacheableValue(value: any) {
      return value !== undefined && value !== null;
    },

    async get(key: string) {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : undefined;
    },

    async set(key: string, value: any, options?: { ttl?: number }) {
      const data = JSON.stringify(value);

      if (options?.ttl) {
        await redis.set(key, data, 'EX', options.ttl);
      } else {
        await redis.set(key, data);
      }
    },

    async del(key: string) {
      await redis.del(key);
    },

    async reset() {
      await redis.flushdb();
    },
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, postgresConfig],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        createGeneralRedisCluster(configService) as any,
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: createBullRedisCluster(configService) as any,
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'data-master-queue',
    }),
    TypeOrmModule.forRootAsync({
      // name: 'default',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        database: configService.get<string>('postgres.database'),
        host: configService.get<string>('postgres.host') ?? '127.0.0.1',
        port: configService.get<number>('postgres.port') ?? 5432,
        username: configService.get<string>('postgres.username'),
        password: configService.get<string>('postgres.password'),
        logging: configService.get<boolean>('postgres.config.logging'),

        autoLoadEntities: true,
        synchronize: true, // only for dev
      }),
    }),
    TypeOrmModule.forFeature([Keyword]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService, CacheService],
})
export class GatewayModule {}
