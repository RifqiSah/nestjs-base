import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { context, propagation, trace } from '@opentelemetry/api';
import { SigNozTrace } from 'apps/dynamic_modules/signoz/decorator';

@Injectable()
export class GatewayService {
  constructor(
    @Inject('REDEEM_SERVICE')
    private readonly kafkaRedeem: ClientKafka,
  ) {}

  @SigNozTrace()
  redeem(body: any) {
    // generate trx id
    const trx_id = body?.transaction_id || crypto.randomUUID();

    // set trx_id to span attributes
    const span = trace.getActiveSpan();
    span?.setAttributes({ transaction_id: trx_id });

    // inject trace context
    const headers = {};
    propagation.inject(context.active(), headers);

    // normal emit
    this.kafkaRedeem.emit('redeem.created', {
      ...body,
      transaction_id: trx_id,
    });

    return {
      message: 'Redeem event published to Kafka',
      data: {
        ...body,
        transaction_id: trx_id,
      },
    };
  }
}
