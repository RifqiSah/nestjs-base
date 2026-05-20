import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { SigNozTrace } from 'apps/dynamic_modules/signoz/decorator';

@Injectable()
export class GatewayService {
  constructor(
    @Inject('REDEEM_SERVICE')
    private readonly kafkaRedeem: ClientKafka,
  ) {}

  @SigNozTrace()
  redeem(body: any) {
    this.kafkaRedeem.emit('redeem.created', body);

    return {
      message: 'Redeem event published to Kafka',
      data: body,
    };
  }
}
