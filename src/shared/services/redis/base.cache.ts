import { createClient, RedisClientType } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';

export abstract class BaseCache {
  client: RedisClientType;
  log: Logger;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.log = config.createLogger(cacheName);
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on('error', (err: unknown) => {
      this.log.error(err);
    });
  }
}
