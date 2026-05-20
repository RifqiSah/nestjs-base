import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule } from '@nestjs/config';
import { SignozModule } from '../../dynamic_modules/signoz/module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    SignozModule.register({
      appName: 'sl-gateway',
      appVersion: '1.0.0',
    }),
    ClientsModule.register([
      {
        name: 'REDEEM_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'gateway-test',
            brokers: ['192.168.10.101:9092'],
          },
          consumer: {
            groupId: 'gateway-test-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
