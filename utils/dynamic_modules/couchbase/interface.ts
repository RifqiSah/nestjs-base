export interface SlCouchbaseConnectionOptions {
  name?: string; // optional, default = 'default'
  connectionString: string;
  bucketName: string; // global bucket for connection
  scopeName?: string; // TODO
  collectionName?: string; // TODO
  username: string;
  password: string;
}
