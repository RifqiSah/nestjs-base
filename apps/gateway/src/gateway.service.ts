import { trace } from '@opentelemetry/api';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
  constructor() {}

  redeem() {
    const tracer = trace.getTracer('redeem-tracer');
    const span = tracer.startSpan('redeem-test-span');

    // operasi lama
    // aaaa
    // aaaa
    // aaaa
    // aaaa

    span.end();
    return 'Jos!';
  }
}
