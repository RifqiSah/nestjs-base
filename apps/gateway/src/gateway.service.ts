import { Inject, Injectable } from '@nestjs/common';
import { Cluster } from 'couchbase';
import { CONNECTION_TOKEN } from 'utils/dynamic_modules/couchbase/tokens';

@Injectable()
export class GatewayService {
  constructor(
    @Inject(CONNECTION_TOKEN('default'))
    private readonly cluster: Cluster,
  ) {}

  async getHello() {
    const bucket = this.cluster.bucket('testing');
    const collection = bucket.collection('cat');

    const result = await collection.get('da90c2ca-44db-45fa-a0ef-accfd8a1a75e');
    return result.content;
  }
}
