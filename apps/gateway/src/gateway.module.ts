import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import * as redisStore from 'cache-manager-ioredis';

import redisConfig from 'apps/config/redis.config';
import { createRedisCluster } from 'apps/utils/redis/redis-cluster.provider';
import postgresConfig from 'apps/configs/postgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keyword } from '../entities/keyword.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, postgresConfig],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const clusterConfig: string =
          configService.get<string>('redis.clusters.nodes') ?? '';
        const clusterUsername: string =
          configService.get<string>('redis.clusters.username') ?? '';
        const clusterPassword: string =
          configService.get<string>('redis.clusters.password') ?? '';

        let clusterNodes: any = [];
        if (clusterConfig.length) {
          try {
            clusterNodes = clusterConfig.split(',').map((n) => {
              const node = n.split(':');
              return {
                host: node[0],
                port: Number(node[1]),
                username: clusterUsername,
                password: clusterPassword,
              };
            });
          } catch (err) {
            console.error('Error parsing redis cluster configuration!', err);
          }
        }

        return {
          store: redisStore,
          clusterConfig: {
            nodes: clusterNodes,
            options: {
              // enableReadyCheck: false,
              // scaleReads: 'master',
              redisOptions: {
                username: clusterUsername,
                password: clusterPassword,
              },
              username: clusterUsername,
              password: clusterPassword,
            },
          },
          ttl: 24 * 60 * 60, // 1 day
          isGlobal: true,
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: createRedisCluster(configService) as any,
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
  providers: [GatewayService],
})
export class GatewayModule {}
