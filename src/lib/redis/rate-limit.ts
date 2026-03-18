import redis from './redis';

type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const current = await redis.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= limit) {
    const ttl = await redis.ttl(key);
    return { allowed: false, retryAfter: ttl > 0 ? ttl : windowSeconds };
  }

  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, windowSeconds);
  await pipeline.exec();

  return { allowed: true, retryAfter: 0 };
}

export async function checkLoginRateLimit(email: string, ip: string) {
  const keyByEmail = `rate_limit:login:email:${email}`;
  const keyByIP = `rate_limit:login:ip:${ip}`;

  const byEmail = await checkRateLimit(keyByEmail, 10, 900);
  if (!byEmail.allowed) return byEmail;

  return checkRateLimit(keyByIP, 40, 900);
}

export async function checkRegisterRateLimit(ip: string) {
  return checkRateLimit(`rate_limit:register:ip:${ip}`, 20, 3600);
}

export async function checkRefreshRateLimit(ip: string) {
  return checkRateLimit(`rate_limit:refresh:ip:${ip}`, 60, 300);
}

export async function resetLoginRateLimit(email: string, ip: string) {
  await redis.del(`rate_limit:login:email:${email}`);
  await redis.del(`rate_limit:login:ip:${ip}`);
}
