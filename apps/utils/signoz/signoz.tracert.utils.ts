import 'dotenv/config';

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

import { SigNozConfig } from '../../configs/signoz.config';

// ENABLE DEBUG LOGGER
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

export function createSigNozSdk({ app_name, app_version }) {
  console.log(SigNozConfig);

  // Configure trace exporter - use console for development debugging
  // const debugExporter = new ConsoleSpanExporter();
  const traceExporter = new OTLPTraceExporter({
    url:
      SigNozConfig.signoz.signoz_tracert_endpoint ||
      'http://127.0.0.1:4318/v1/traces',
    headers: SigNozConfig.signoz.aignoz_tracert_headers
      ? JSON.parse(SigNozConfig.signoz.aignoz_tracert_headers)
      : {},
  });

  // Create SDK instance with comprehensive configuration
  return new NodeSDK({
    traceExporter,
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: app_name,
      [ATTR_SERVICE_VERSION]: app_version,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable instrumentations that might cause issues
        '@opentelemetry/instrumentation-fs': { enabled: false },

        // Configure HTTP instrumentation for better trace context
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          ignoreIncomingRequestHook: (req) => {
            // Ignore health check endpoints
            return (
              req.url?.includes('/health') ||
              req.url?.includes('/metrics') ||
              false
            );
          },
        },
      }),
    ],
  });
}
