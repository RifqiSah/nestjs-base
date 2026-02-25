import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { SlCouchbaseModule } from 'utils/dynamic_modules/couchbase/module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SlCouchbaseModule.forRootAsync([
      {
        useFactory: (configService: ConfigService) => ({
          // connectionName: 'default',
          connectionString:
            configService.get<string>('COUCHBASE_HOST') ??
            'couchbase://127.0.0.1',
          username: configService.get<string>('COUCHBASE_USER') ?? '',
          password: configService.get<string>('COUCHBASE_PASSWORD') ?? '',
          bucketName: configService.get<string>('COUCHBASE_BUCKET') ?? '',
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
