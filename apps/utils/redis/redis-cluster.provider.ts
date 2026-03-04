import { ConfigService } from '@nestjs/config';
import { Cluster } from 'ioredis';

// new package?
import KeyvRedis, { createCluster } from '@keyv/redis';
import { Keyv } from 'keyv';
// import { createCache } from 'cache-manager';

function getClusterConfig(configService: ConfigService) {
  return {
    nodes:
      configService.get<string>('redis.clusters.nodes') ??
      process.env.REDIS_CLUSTERS ??
      '',
    username:
      configService.get<string>('redis.clusters.username') ??
      process.env.REDIS_CLUSTERS_USERNAME ??
      '',
    password:
      configService.get<string>('redis.clusters.password') ??
      process.env.REDIS_CLUSTERS_PASSWORD ??
      '',
  };
}

export function createGeneralRedisCluster(configService: ConfigService) {
  const { nodes, username, password } = getClusterConfig(configService);
  // console.log(
  //   `[RedisCluster General] nodes=${nodes}, username=${username}, password=${password}`,
  // );

  const cluster = createCluster({
    rootNodes: nodes.split(',').map((node) => {
      return {
        url: `redis://${node}`,
      };
    }),
    defaults: {
      username: username,
      password: password,
    },
  });

  const keyvRedis = new KeyvRedis(cluster, {});
  const keyvStore = new Keyv({
    store: keyvRedis,
    namespace: '',
    useKeyPrefix: false,
  });

  console.log('Keyv1', keyvRedis);

  return {
    stores: [keyvStore],
    ttl: 24 * 60 * 60 * 1000,
  };
}

/**
 * Function for creating redis cluster for bull queue
 * @param configService
 * @returns
 */
export function createBullRedisCluster(
  configService: ConfigService,
): Cluster | object {
  const { nodes, username, password } = getClusterConfig(configService);
  // console.log(
  //   `[RedisCluster Bull] nodes=${nodes}, username=${username}, password=${password}`,
  // );

  let clusterNodes: any = [];
  if (nodes.length) {
    try {
      clusterNodes = nodes.split(',').map((n) => {
        const node = n.split(':');
        return {
          host: node[0],
          port: Number(node[1]),
          username,
          password,
        };
      });
    } catch (err) {
      console.error(
        '[RedisCluster Bull] Error parsing redis cluster configuration!',
      );
    }
  }

  const redisConfig = {
    enableReadyCheck: false,
    // scaleReads: 'all',
    redisOptions: {
      username: username,
      password: password,
    },
    username: username,
    password: password,
  };

  // console.log(`[RedisCluster Bull] Config: ${JSON.stringify(redisConfig)}`);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const cluster = new Cluster(clusterNodes, redisConfig);
  cluster.on('error', (err) => {
    console.error('[RedisCluster Bull]', err);
  });

  return cluster;
}
