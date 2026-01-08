import { Redis as UpstashRedis } from '@upstash/redis';
// import Redis from 'ioredis'; // Local Redis disabled

let redisClient;

console.log('Initializing Redis Client...');
// console.log('UPSTASH_URL:', process.env.UPSTASH_REDIS_REST_URL); // Debug log (be careful with secrets)

// Force Upstash Redis usage
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
  // If credentials are missing, we should probably throw an error or handle it gracefully
  // ensuring we don't fall back to local if not desired.
  console.error("CRITICAL: Upstash Redis credentials (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) are missing from environment variables!");

  // Fallback (Commented out as requested)
  /*
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
  */
}

export default redisClient;
