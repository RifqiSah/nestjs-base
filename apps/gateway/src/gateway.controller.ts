import { Controller, Post, Inject } from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(
    @Inject(GatewayService)
    private readonly gatewayService: GatewayService,
  ) {}

  @Post('redeem')
  redeem() {
    return this.gatewayService.redeem();
  }
}
