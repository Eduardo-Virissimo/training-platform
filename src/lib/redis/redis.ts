import Redis from 'ioredis';

const redisURL = process.env.REDIS_URL;

if (!redisURL) {
  console.error('Error: REDIS_URL is not defined in .env.local');
}

const redisGlobal = global as unknown as { redis: Redis };

export const redis =
  redisGlobal.redis ||
  new Redis(redisURL!, {
    maxRetriesPerRequest: 1,
    showFriendlyErrorStack: true,
  });

redis.on('error', (err) => {
  if (err.message.includes('NOAUTH')) {
    console.error('Redis Authentication Error: Check your password in .env.local');
  }
});

if (process.env.NODE_ENV !== 'production') {
  redisGlobal.redis = redis;
}

export default redis;
