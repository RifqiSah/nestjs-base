import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { createSigNozSdk } from './sdk';
import type { SignozModuleOptions } from './interface';

@Injectable()
export class SignozService implements OnModuleInit, OnModuleDestroy {
  private sdk: NodeSDK | undefined;

  constructor(
    @Inject('SIGNOZ_OPTIONS')
    private readonly options: SignozModuleOptions,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async onModuleInit() {
    this.sdk = createSigNozSdk(this.options);
    this.sdk.start();

    console.log(`[SigNoz] Started: ${this.options.appName}`);
  }

  async onModuleDestroy() {
    if (this.sdk) {
      await this.sdk.shutdown();
      console.log('[SigNoz] Shutdown');
    }
  }
}
