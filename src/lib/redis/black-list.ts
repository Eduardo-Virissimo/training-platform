import redis from './redis';
import { AUTH_CONFIG } from '../auth';

const BLACKLIST_PREFIX = 'token_blacklist:user:';

export async function blacklistUserTokens(userId: string): Promise<void> {
  const key = `${BLACKLIST_PREFIX}${userId}`;
  await redis.set(key, Date.now().toString(), 'EX', AUTH_CONFIG.accessTokenExpiresIn);
}

export async function isUserBlacklisted(userId: string): Promise<boolean> {
  const key = `${BLACKLIST_PREFIX}${userId}`;
  const result = await redis.get(key);
  return result !== null;
}

export async function removeFromBlacklist(userId: string): Promise<void> {
  const key = `${BLACKLIST_PREFIX}${userId}`;
  await redis.del(key);
}
