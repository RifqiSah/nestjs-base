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
    // span?.setAttributes({ transaction_id: trx_id });
    span?.setAttributes({
      transaction_id: trx_id,
      'messaging.system': 'kafka',
      'messaging.operation': 'publish',
      'messaging.destination': 'redeem.created', // topic name
    });

    // inject trace context
    const headers = {};
    propagation.inject(context.active(), headers);
    headers['transaction_id'] = trx_id;

    // normal emit
    // this.kafkaRedeem.emit('redeem.created', {
    //   ...body,
    //   transaction_id: trx_id,
    // });

    // emit with sync trace_id
    this.kafkaRedeem.emit('redeem.created', {
      value: {
        ...body,
        transaction_id: trx_id,
      },
      headers,
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
