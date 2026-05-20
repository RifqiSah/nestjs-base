import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  TraceIdRatioBasedSampler,
  ParentBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { SignozModuleOptions } from './interface';

const isProduction = process.env.NODE_ENV === 'production';

diag.setLogger(
  new DiagConsoleLogger(),
  isProduction ? DiagLogLevel.ERROR : DiagLogLevel.DEBUG,
);

export function createSigNozSdk(options: SignozModuleOptions) {
  const otlpExporter = new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      'http://localhost:4318/v1/traces',

    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
      ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
      : {},
  });

  console.log(process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT);

  const consoleExporter = new ConsoleSpanExporter();

  return new NodeSDK({
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(isProduction ? 0.2 : 1.0),
    }),

    spanProcessors: [
      new BatchSpanProcessor(otlpExporter, {
        maxExportBatchSize: isProduction ? 200 : 50,
        exportTimeoutMillis: isProduction ? 5000 : 2000,
        scheduledDelayMillis: isProduction ? 2000 : 1000,
      }),

      ...(isProduction ? [] : [new SimpleSpanProcessor(consoleExporter)]),
    ],

    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: options.appName,
      [ATTR_SERVICE_VERSION]: options.appVersion,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.NODE_ENV || 'development',
    }),

    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          ignoreIncomingRequestHook: (req) => {
            // ignored paths will not hooked by SigNoz
            const ignorePaths = ['/health', '/metrics', '/swagger'];

            return ignorePaths.some((path) => req.url?.includes(path));
          },
        },
      }),
    ],
  });
}
