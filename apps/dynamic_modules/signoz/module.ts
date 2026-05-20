import { DynamicModule, Global, Module } from '@nestjs/common';
import { SignozService } from './service';
import { SignozModuleOptions } from './interface';

@Global()
@Module({})
export class SignozModule {
  static register(options: SignozModuleOptions): DynamicModule {
    return {
      module: SignozModule,
      providers: [
        {
          provide: 'SIGNOZ_OPTIONS',
          useValue: options,
        },
        SignozService,
      ],
      exports: [SignozService],
    };
  }
}
