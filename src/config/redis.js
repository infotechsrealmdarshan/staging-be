import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';

let redisClient;

// Check for Upstash REST URL/Token first
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.log('Using Upstash Redis (HTTP)');
  const upstash = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Create a wrapper to match ioredis API used in the app
  redisClient = {
    get: (key) => upstash.get(key),
    set: (key, value, mode, duration) => {
      // Handle "EX" expiration argument from ioredis style
      if (mode === 'EX' && duration) {
        return upstash.set(key, value, { ex: duration });
      }
      return upstash.set(key, value);
    },
    del: (key) => upstash.del(key),
    on: (event, callback) => {
      // Simulate connection events for Upstash (stateless)
      if (event === 'connect') {
        setTimeout(callback, 100);
      }
    },
    // Add pass-through for other potential methods if needed
    // ...upstash
  };
} else {
  // Existing IORedis implementation
  redisClient = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });
}

export default redisClient;
