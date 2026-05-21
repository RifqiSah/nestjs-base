import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaConsumerSigNozTrace } from 'apps/dynamic_modules/signoz/decorator';

@Controller()
export class RedeemConsumerController {
  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  @EventPattern('redeem.created')
  @KafkaConsumerSigNozTrace()
  async handleRedeemCreated(@Payload() message: any) {
    console.log('Incoming Kafka Message');

    // simulasi proses redeem
    console.log('Redeem processed!');
    console.log(message);

    // random sleep
    const delay = Math.floor(Math.random() * 5 + 1) * 1000;
    console.log(`Sleeping ${delay / 1000} seconds...`);
    await this.sleep(delay);

    console.log('Redeem success!');
  }
}
