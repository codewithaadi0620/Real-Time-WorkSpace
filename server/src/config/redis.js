const Redis = require('ioredis');
const config = require('./env');

class MemoryStore {
  constructor() {
    this.store = new Map();
    this.hashes = new Map();
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async set(key, value, mode, ttl) {
    this.store.set(key, value);
    if (mode === 'EX' && ttl) {
      setTimeout(() => this.store.delete(key), ttl * 1000);
    }
    return 'OK';
  }

  async del(key) {
    this.store.delete(key);
    this.hashes.delete(key);
    return 1;
  }

  async hset(key, field, value) {
    if (!this.hashes.has(key)) {
      this.hashes.set(key, new Map());
    }
    this.hashes.get(key).set(field, value);
    return 1;
  }

  async hdel(key, field) {
    if (this.hashes.has(key)) {
      this.hashes.get(key).delete(field);
    }
    return 1;
  }

  async hgetall(key) {
    if (!this.hashes.has(key)) return {};
    const obj = {};
    for (const [f, v] of this.hashes.get(key).entries()) {
      obj[f] = v;
    }
    return obj;
  }

  on() {}
}

const memoryFallback = new MemoryStore();
let redisClient = memoryFallback;

try {
  const redis = new Redis({
    host: config.REDIS.host,
    port: config.REDIS.port,
    password: config.REDIS.password || undefined,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop retrying after 3 attempts
      return 500;
    },
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  redis.connect().then(() => {
    console.log('✅ Connected to external Redis instance.');
    redisClient = redis;
  }).catch(() => {
    console.log('ℹ️ Redis server unavailable; falling back to in-memory store.');
    redisClient = memoryFallback;
  });

  redis.on('error', () => {
    // Suppress unhandled error log loops
  });
} catch (e) {
  console.log('ℹ️ Redis initialization error; using in-memory store.');
  redisClient = memoryFallback;
}

module.exports = new Proxy({}, {
  get(target, prop) {
    return (...args) => {
      if (typeof redisClient[prop] === 'function') {
        return redisClient[prop](...args);
      }
      return Promise.resolve(null);
    };
  }
});
