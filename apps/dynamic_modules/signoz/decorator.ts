import {
  trace,
  SpanStatusCode,
  context,
  propagation,
} from '@opentelemetry/api';
import { KafkaContext } from '@nestjs/microservices';

export function SigNozTrace(spanName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tracer = trace.getTracer('nestjs-tracer');

      const finalSpanName =
        spanName || `${target.constructor.name}.${propertyKey}`;

      return tracer.startActiveSpan(finalSpanName, async (span) => {
        try {
          span.setAttributes({
            'code.namespace': target.constructor.name,
            'code.function': propertyKey,
          });

          const result = await originalMethod.apply(this, args);

          span.setStatus({
            code: SpanStatusCode.OK,
          });

          return result;
        } catch (error: any) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          span.recordException(error);

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });

          throw error;
        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}

export function KafkaConsumerSigNozTrace(spanName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // NestJS Kafka
      const payload = args[0];

      // raw kafka message
      const kafkaContext: KafkaContext = args[1];
      const kafkaMessage = kafkaContext.getMessage();

      // kafka metadata
      const kafkaTopic = kafkaContext.getTopic();
      const kafkaPartition = kafkaContext.getPartition();
      const kafkaOffset = kafkaMessage.offset;

      // kafka headers
      const rawHeaders = kafkaMessage.headers || {};

      // if header is buffer, convert to string
      const headers = Object.fromEntries(
        Object.entries(rawHeaders).map(([key, value]) => [
          key,
          Buffer.isBuffer(value) ? value.toString() : value,
        ]),
      );

      // extract parent trace context
      const extractedContext = propagation.extract(context.active(), headers);
      const tracer = trace.getTracer(target.constructor.name);

      const finalSpanName =
        spanName || `${target.constructor.name}.${propertyKey}`;

      return context.with(extractedContext, async () => {
        return tracer.startActiveSpan(finalSpanName, async (span) => {
          try {
            const transactionId = payload?.transaction_id;

            // auto tags
            span.setAttributes({
              // transaction metadata
              transaction_id: transactionId,

              // kafka metadata
              'messaging.system': 'kafka',
              'messaging.destination.name': kafkaTopic,
              'messaging.destination_kind': 'topic',
              'messaging.operation': 'process',
              'messaging.kafka.partition': kafkaPartition,
              'messaging.kafka.offset': kafkaOffset,

              // app metadata
              'app.consumer': target.constructor.name,
              'app.handler': propertyKey,
            });

            const result = await originalMethod.apply(this, args);

            span.setStatus({
              code: SpanStatusCode.OK,
            });

            return result;
          } catch (error: any) {
            span.recordException(error);

            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });

            throw error;
          } finally {
            span.end();
          }
        });
      });
    };

    return descriptor;
  };
}
