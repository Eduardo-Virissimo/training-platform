import Redis from 'ioredis';

const redisURL = process.env.REDIS_URL;

if (!redisURL) {
  console.error('❌ Erro: REDIS_URL não definida no .env.local');
}

const redisGlobal = global as unknown as { redis: Redis };

// Criamos a instância e adicionamos um log para saber se conectou
export const redis =
  redisGlobal.redis ||
  new Redis(redisURL!, {
    // Configurações de segurança para evitar o loop infinito de logs se falhar
    maxRetriesPerRequest: 1,
    showFriendlyErrorStack: true,
  });

redis.on('error', (err) => {
  if (err.message.includes('NOAUTH')) {
    console.error('❌ Erro de Autenticação no Redis: Verifique sua senha no .env.local');
  }
});

if (process.env.NODE_ENV !== 'production') {
  redisGlobal.redis = redis;
}

export default redis;
