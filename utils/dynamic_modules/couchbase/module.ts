import { DynamicModule, Global, Module } from '@nestjs/common';
import { Cluster, connect } from 'couchbase';
import { SlCouchbaseConnectionOptions } from './interface';
import { CONNECTION_TOKEN, CONFIG_TOKEN } from './tokens';

@Global()
@Module({})
export class SlCouchbaseModule {
  static forRootAsync(
    optionsArray: {
      name?: string;
      useFactory: (
        ...args: any[]
      ) => Promise<SlCouchbaseConnectionOptions> | SlCouchbaseConnectionOptions;
      inject?: any[];
    }[],
  ): DynamicModule {
    const providers = optionsArray.flatMap((opt) => {
      const name = opt.name || 'default';
      const configToken = CONFIG_TOKEN(name);
      const connToken = CONNECTION_TOKEN(name);

      const configProvider = {
        provide: configToken,
        useFactory: opt.useFactory,
        inject: opt.inject || [],
      };

      const connectionProvider = {
        provide: connToken,
        useFactory: async (config: SlCouchbaseConnectionOptions) => {
          console.log('Couchbase config:', config);

          const cluster = await connect(config.connectionString, {
            username: config.username,
            password: config.password,
          });

          return cluster as Cluster;
        },
        inject: [configToken],
      };

      return [configProvider, connectionProvider];
    });

    return {
      module: SlCouchbaseModule,
      providers,
      exports: providers,
    };
  }
}
