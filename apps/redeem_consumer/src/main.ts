import { NestFactory } from '@nestjs/core';
import { RedeemConsumerModule } from './redeem_consumer.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RedeemConsumerModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'redeem-test', // redeem-test-server
          brokers: ['192.168.10.101:9092'],
        },
        consumer: {
          groupId: 'redeem-test-consumer', // redeem-test-consumer-server
        },
      },
    },
  );

  await app.listen();
}

bootstrap();
