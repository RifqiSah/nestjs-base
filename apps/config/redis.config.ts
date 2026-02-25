import * as process from 'process';

export default () => ({
  redis: {
    clusters: {
      nodes: process.env.REDIS_CLUSTERS,
      username: process.env.REDIS_CLUSTERS_USERNAME,
      password: process.env.REDIS_CLUSTERS_PASSWORD,
    },
  },
});
