import { ConfigService } from '@nestjs/config';
import { Cluster } from 'ioredis';

// new package?
import KeyvRedis from '@keyv/redis';
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

export function createGeneralRedisCluster(
  configService: ConfigService,
): object | Cluster {
  const { nodes, username, password } = getClusterConfig(configService);
  console.log(
    `[RedisCluster General] nodes=${nodes}, username=${username}, password=${password}`,
  );

  // 1 node only
  const firstNode = nodes.split(',')[0];
  const redisUri = `redis://${username}:${password}@${firstNode}`;
  const keyv = new Keyv({
    namespace: 'nestjs-cache',
    store: new KeyvRedis(redisUri),
    ttl: 24 * 60 * 60 * 1000,
  });

  console.log(`[RedisCluster General] Config: ${JSON.stringify(keyv)}`);

  return {
    isGlobal: true,
    stores: [keyv],
  };

  /*
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
        '[RedisCluster General] Error parsing redis cluster configuration!',
      );
    }
  }

  const redisConfig = {
    // enableReadyCheck: false,
    // scaleReads: 'all',
    redisOptions: {
      username: username,
      password: password,
    },
    username: username,
    password: password,
  };

  console.error(
    `[RedisCluster General] Config: ${JSON.stringify(redisConfig)}`,
  );

  const cluster = new Cluster(clusterNodes, redisConfig);
  cluster.on('error', (err) => {
    console.error('[RedisCluster General]', err);
  });

  cluster.on('connect', () => console.log('[RedisCluster] connect'));
  cluster.on('ready', () => console.log('[RedisCluster] ready'));
  cluster.on('reconnecting', () => console.log('[RedisCluster] reconnecting'));

  await new Promise<void>((resolve, reject) => {
    cluster.once('ready', () => {
      console.log('[RedisCluster General] READY');
      resolve();
    });

    cluster.once('error', reject);
  });

  const keyv = new Keyv({
    store: new KeyvRedis(cluster as any),
    ttl: 24 * 60 * 60, // 1 day
    // namespace: 'nestjs-cache',
  });

  return {
    isGlobal: true,
    store: createCache({
      stores: [keyv],
    }),
  };
  */
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
  console.log(
    `[RedisCluster Bull] nodes=${nodes}, username=${username}, password=${password}`,
  );

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

  console.error(`[RedisCluster Bull] Config: ${JSON.stringify(redisConfig)}`);

  const cluster = new Cluster(clusterNodes, redisConfig);
  cluster.on('error', (err) => {
    console.error('[RedisCluster Bull]', err);
  });

  return cluster;
}
