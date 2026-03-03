import { ConfigService } from '@nestjs/config';
import { Cluster } from 'ioredis';

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

function redisClusterStore(redis: Cluster) {
  return {
    async get(key: string) {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    },
    async set(key: string, value: any, option?: any) {
      const data = JSON.stringify(value);
      if (option?.ttl) {
        await redis.set(key, data, 'EX', option.ttl);
      } else {
        await redis.set(key, data);
      }
    },
    async del(key: string) {
      await redis.del(key);
    },
  };
}

export function createGeneralRedisCluster(
  configService: ConfigService,
): Cluster | object {
  const { nodes, username, password } = getClusterConfig(configService);
  console.log(
    `[RedisCluster General] nodes=${nodes}, username=${username}, password=${password}`,
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
        '[RedisCluster General] Error parsing redis cluster configuration!',
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

  console.error(
    `[RedisCluster General] Config: ${JSON.stringify(redisConfig)}`,
  );

  const cluster = new Cluster(clusterNodes, redisConfig);
  cluster.on('error', (err) => {
    console.error('[RedisCluster General]', err);
  });

  return {
    isGlobal: true,
    ttl: 24 * 60 * 60, // 1 day
    store: redisClusterStore(cluster),
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
