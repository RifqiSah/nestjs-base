import { Controller, Post, Inject, Body } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { SigNozTrace } from 'apps/dynamic_modules/signoz/decorator';

@Controller()
export class GatewayController {
  constructor(
    @Inject(GatewayService)
    private readonly gatewayService: GatewayService,
  ) {}

  @Post('redeem')
  @SigNozTrace()
  redeem(@Body() body: any) {
    return this.gatewayService.redeem(body);
  }
}
