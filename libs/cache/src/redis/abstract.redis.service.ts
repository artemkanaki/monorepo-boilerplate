import Redis, { ChainableCommander } from 'ioredis';

import { CacheExpireOptionsEnum, CacheOptions, ICacheService, ICacheSetOptions } from '../interfaces';

export abstract class AbstractRedisService implements ICacheService {
  public readonly redis: Redis;

  constructor(options: CacheOptions) {
    this.redis = new Redis({
      ...options,
      db: options.persistentDb || options.db,
    });
  }

  public async onModuleDestroy(): Promise<void> {
    try {
      await this.redis.disconnect();
    } catch (_err) {}
  }

  public async set(key: string, value: string | number, opts: ICacheSetOptions = {}) {
    const args:
      | [string, string | number]
      | [string, string | number, 'NX']
      | [string, string | number, 'XX']
      | [string, string | number, 'EX', number]
      | [string, string | number, 'EX', number, 'NX']
      | [string, string | number, 'EX', number, 'XX'] = [key, value];

    if (opts?.ttl) {
      args.push('EX', opts.ttl);
    }

    const nx = opts?.nx || opts?.ifNotExists;
    const xx = opts?.xx || opts?.extendOnly;
    if (nx && xx) {
      throw new Error(`NX and XX are mutually exclusive - ${this.constructor.name}`);
    }
    if (nx) {
      args.push('NX');
    }

    if (xx) {
      args.push('XX');
    }

    await this.redis.set(...args);
  }

  public async subscribe(channel: string, handler: (channel: string, message: string) => void) {
    this.redis.subscribe(channel);
    this.redis.on('message', handler);
  }

  public async publish(channel: string, message: string) {
    return this.redis.publish(channel, message);
  }

  public async unsubscribe() {
    return this.redis.unsubscribe();
  }

  public async disconnect() {
    return this.redis.disconnect();
  }

  public async get(key: string) {
    return this.redis.get(key);
  }

  public async hGetAll(key: string) {
    return this.redis.hgetall(key);
  }

  public async hGetAllKeys<T = unknown>(keys: string[]): Promise<T[]> {
    const commands: string[][] = keys.map((key) => ['hgetall', key]);
    const results = await this.redis.pipeline(commands).exec();

    return results?.map((result) => result[1]) as T[];
  }

  public async hGet(key: string, field: string) {
    return this.redis.hget(key, field);
  }

  public async hmGet(key: string, fields: string[]): Promise<(string | null)[]> {
    return this.redis.hmget(key, ...fields);
  }

  public async getOrLoad<T = object>(key: string, load: () => Promise<T>, ttlSec: number): Promise<T> {
    const cached = await this.get(key);

    if (cached) {
      return JSON.parse(cached) as T;
    }

    return load().then((value) => {
      this.set(key, JSON.stringify(value), { ttl: ttlSec });
      return value;
    });
  }

  public async hDel(key: string, field: string | string[]): Promise<number> {
    const fields = Array.isArray(field) ? field : [field];

    return this.redis.hdel(key, ...fields);
  }

  public async hIncrBy(key: string, field: string, inc: number) {
    return this.redis.hincrby(key, field, inc);
  }

  public async hSet(key: string, data: Record<string, string | number>, ttlSec?: number) {
    const args = Object.entries(data).flat();
    await this.redis.hset(key, ...args);
    if (ttlSec) {
      await this.expire(key, ttlSec);
    }
  }

  public async mget(keys: string[]) {
    return this.redis.mget(...keys);
  }

  public async mgetPattern(pattern: string) {
    const keys = await this.findKeys(pattern);

    if (!keys.length) {
      return [];
    }

    return this.mget(keys);
  }

  public async mset(args: Map<string | Buffer | number, string | Buffer | number>, ttlSec: number) {
    const commands: Array<string | number | Buffer>[] = [];

    for (const [key, value] of args.entries()) {
      commands.push(['set', key, value, 'ex', ttlSec]);
    }

    return this.redis.multi(commands).exec();
  }

  public async del(key: string) {
    return this.redis.del(key);
  }

  public async delPatterns(keysPatterns: string[]) {
    const keysPromises: Promise<string[]>[] = [];

    keysPatterns.forEach((keyPattern) => {
      keysPromises.push(this.findKeys(keyPattern));
    });

    const keys = (await Promise.all(keysPromises)).flat();

    if (keys.length) {
      await Promise.all(keys.map((key) => this.del(key)));
    }
  }

  public async findKeys(keyPattern: string) {
    return this.redis.keys(keyPattern);
  }

  public async ping() {
    return this.redis.ping();
  }

  // third argument available since: 7.0.0
  public async expire(key: string, ttlSec: number, expireOpts?: CacheExpireOptionsEnum) {
    const args: [string, number] | [string, number, string] = [key, ttlSec];
    if (expireOpts) {
      args.push(expireOpts);
    }

    return this.redis.expire(...args);
  }

  // available since: 7.0.0
  public async expireTime(key: string) {
    return this.redis.expiretime(key);
  }

  public async ttl(key: string) {
    return this.redis.ttl(key);
  }

  public async rename(key: string, newKey: string) {
    return this.redis.rename(key, newKey);
  }

  public async exists(...args: string[]): Promise<number> {
    return this.redis.exists(...args);
  }

  public async incrByAndExpire(key: string, incrBy: number, expire: number): Promise<number> {
    const value = await this.redis.eval(
      'local r = redis.call("INCRBY", KEYS[1], ARGV[1]) redis.call("EXPIRE", KEYS[1], ARGV[2]) return r',
      1,
      key,
      incrBy,
      expire,
    );
    return value as number;
  }

  public async incrAndExpire(key: string, expire: number): Promise<number> {
    const value = await this.redis.eval(
      'local r = redis.call("INCR", KEYS[1]) if r == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end return r',
      1,
      key,
      expire,
    );
    return value as number;
  }

  public async incrBy(key: string, incrBy: number): Promise<number> {
    return this.redis.incrby(key, incrBy);
  }

  public pipeline(commands: unknown[][]): ChainableCommander {
    return this.redis.pipeline(commands);
  }

  public async sAdd(key: string, ...values: string[]) {
    return this.redis.sadd(key, ...values);
  }

  public async sRem(key: string, ...values: string[]) {
    return this.redis.srem(key, values);
  }

  public async sIsMember(key: string, value: string) {
    return this.redis.sismember(key, value);
  }

  public async sMembers(key: string) {
    return this.redis.smembers(key);
  }

  public async sMembersAll(key: string): Promise<string[]> {
    const result = await this.redis.multi().smembers(key).del(key).exec();

    if (!result) {
      return [];
    }

    return (result[0]?.[1] as string[]) || [];
  }

  public async zAdd(key: string, values: (string | Buffer | number)[]) {
    return this.redis.zadd(key, ...values);
  }

  public async zRange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.zrange(key, start, stop);
  }

  public async zRangeByScore(key: string, min: number, max: number): Promise<string[]> {
    return this.redis.zrangebyscore(key, min, max);
  }

  public async zRemRangeByScore(key: string, min: number, max: number): Promise<number> {
    return this.redis.zremrangebyscore(key, min, max);
  }

  public async zRevRank(key: string, member: string | Buffer | number): Promise<number | null> {
    return this.redis.zrevrank(key, member);
  }

  public async zRevRange(key: string, start: number, end: number): Promise<string[]> {
    return this.redis.zrange(key, start, end, 'REV');
  }

  public async zCard(key: string): Promise<number> {
    return this.redis.zcard(key);
  }

  public async zRemRangeByRank(key: string, start: number, stop: number) {
    return this.redis.zremrangebyrank(key, start, stop);
  }

  public async lPush(key: string, values: (string | Buffer | number)[]) {
    return this.redis.lpush(key, ...values);
  }

  public async rPop(key: string) {
    return this.redis.rpop(key);
  }

  public async rPopBulk(key: string, count: number): Promise<string[] | null> {
    return this.redis.rpop(key, count);
  }

  public async lPopAll<T>(key: string): Promise<T[]> {
    const result = await this.redis.multi().lrange(key, 0, -1).del(key).exec();
    return result?.[0][1] as T[];
  }

  public async multi(commands: Array<string | number | Buffer>[]) {
    return this.redis.multi(commands).exec();
  }

  public async flushDb() {
    this.ensureOperationAllowed();
    await this.redis.flushdb();
  }

  public async shutdown() {
    this.ensureOperationAllowed();
    await this.redis.disconnect();
  }

  public ensureOperationAllowed() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Allowed only for test env');
    }
  }
}
