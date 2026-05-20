import { Injectable } from '@nestjs/common';
import { SigNozTrace } from 'apps/dynamic_modules/signoz/decorator';

@Injectable()
export class GatewayService {
  constructor() {}

  @SigNozTrace()
  redeem() {
    return 'Jos!';
  }
}
