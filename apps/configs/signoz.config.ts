import * as process from 'process';
import 'dotenv/config';

export const SigNozConfig = {
  signoz: {
    signoz_tracert_endpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    aignoz_tracert_headers: process.env.OTEL_EXPORTER_OTLP_HEADERS,
    signoz_resource_attributes: process.env.OTEL_RESOURCE_ATTRIBUTES,
  },
};
