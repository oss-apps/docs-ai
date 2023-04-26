import { createClient } from 'redis';
import { env } from '~/env.mjs';

export const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('error', err => console.log('Redis Client Error', err));

const connectPromise = redisClient.connect()
  .catch(err => console.log('Redis Client Error', err));

export const getRedisClient = async () => {
  await connectPromise;

  return redisClient;
}
