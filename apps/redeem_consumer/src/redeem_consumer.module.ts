import { Module } from '@nestjs/common';
import { RedeemConsumerController } from './redeem_consumer.controller';
import { SignozModule } from 'apps/dynamic_modules/signoz/module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    SignozModule.register({
      appName: 'sl-redeem',
      appVersion: '1.0.0',
    }),
  ],
  controllers: [RedeemConsumerController],
})
export class RedeemConsumerModule {}
