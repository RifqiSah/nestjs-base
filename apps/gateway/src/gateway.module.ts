import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import postgresConfig from 'apps/configs/postgres.config';
import { Keyword } from '../entities/keyword.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig],
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
