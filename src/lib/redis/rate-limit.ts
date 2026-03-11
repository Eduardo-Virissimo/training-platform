import redis from './redis';

export async function checkBruteForce(identifier: string) {
  const key = `rate_limit:login:${identifier}`;
  const limit = 5;
  const windowSeconds = 900;

  const current = await redis.get(key);
  const count = current ? parseInt(current) : 0;

  if (count >= limit) {
    const ttl = await redis.ttl(key);
    return {
      allowed: false,
      retryAfter: ttl > 0 ? ttl : windowSeconds,
    };
  }

  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, windowSeconds);
  await pipeline.exec();

  return {
    allowed: true,
    retryAfter: 0,
  };
}

export async function resetBruteForce(identifier: string) {
  await redis.del(`rate_limit:login:${identifier}`);
}
