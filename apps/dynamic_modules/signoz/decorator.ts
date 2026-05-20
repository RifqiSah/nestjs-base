import { trace, SpanStatusCode } from '@opentelemetry/api';

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
