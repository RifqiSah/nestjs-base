// THIS MUST BE THE FIRST IMPORT
import { createSigNozSdk } from '../../utils/signoz/signoz.tracert.utils';
createSigNozSdk({
  app_name: 'sl-gateway',
  app_version: '1.0.0',
}).start(); // Start tracer immediately before creating the app

import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  await app.listen(process.env.port ?? 3000);
}

bootstrap();
