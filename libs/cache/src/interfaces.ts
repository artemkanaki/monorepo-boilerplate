import { ChainableCommander, RedisOptions as IoRedisRedisOptions } from 'ioredis';

import { ModuleMetadata } from '@nestjs/common/interfaces';
import { OnModuleDestroy } from '@nestjs/common';

export type CacheOptions = IoRedisRedisOptions & { persistentDb?: number };

export interface CacheModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  useFactory?: (...args: any[]) => Promise<CacheOptions>;
  inject?: any[];
}

export enum CacheExpireOptionsEnum {
  NX = 'NX',
  XX = 'XX',
  GT = 'GT',
  LT = 'LT',
}

export interface ICacheSetOptions {
  ttl?: number;
  nx?: boolean;
  ifNotExists?: boolean;
  xx?: boolean;
  extendOnly?: boolean;
}

export interface ICacheService extends OnModuleDestroy {
  onModuleDestroy(): Promise<void>;

  set(key: string, value: string | number, opts: ICacheSetOptions): Promise<void>;

  subscribe(channel: string, handler: (channel: string, message: string) => void): Promise<void>;

  publish(channel: string, message: string): Promise<any>;

  unsubscribe(): Promise<any>;

  disconnect(): Promise<any>;

  get(key: string): Promise<any>;

  hGetAll(key: string): Promise<Record<string, string>>;

  hGetAllKeys<T = unknown>(keys: string[]): Promise<T[]>;

  hGet(key: string, field: string): Promise<string | null>;

  hmGet(key: string, fields: string[]): Promise<(string | null)[]>;

  getOrLoad<T = object>(key: string, load: () => Promise<T>, ttlSec: number): Promise<T>;

  hDel(key: string, field: string | string[]): Promise<number>;

  hIncrBy(key: string, field: string, inc: number): Promise<number>;

  hSet(key: string, data: Record<string, string | number>, ttlSec?: number): Promise<any>;

  mget(keys: string[]): Promise<any>;

  mgetPattern(pattern: string): Promise<any>;

  mset(args: Map<string | Buffer | number, string | Buffer | number>, ttlSec: number): Promise<any>;

  del(key: string): Promise<any>;

  delPatterns(keysPatterns: string[]): Promise<void>;

  findKeys(keyPattern: string): Promise<any>;

  ping(): Promise<any>;

  expire(key: string, ttlSec: number, expireOpts?: CacheExpireOptionsEnum): Promise<any>;

  expireTime(key: string): Promise<number>;

  ttl(key: string): Promise<any>;

  rename(key: string, newKey: string): Promise<any>;

  exists(...args: string[]): Promise<number>;

  incrByAndExpire(key: string, incrBy: number, expire: number): Promise<number>;

  incrAndExpire(key: string, expire: number): Promise<number>;

  incrBy(key: string, incrBy: number): Promise<number>;

  pipeline(commands: unknown[][]): ChainableCommander;

  sAdd(key: string, ...values: string[]): Promise<any>;

  sRem(key: string, ...values: string[]): Promise<any>;

  sIsMember(key: string, value: string): Promise<number>;

  sMembers(key: string): Promise<string[]>;

  sMembersAll(key: string): Promise<string[]>;

  zAdd(key: string, values: (string | Buffer | number)[]): Promise<any>;

  zRange(key: string, start: number, stop: number): Promise<string[]>;

  zRangeByScore(key: string, min: number, max: number): Promise<string[]>;

  zRemRangeByScore(key: string, min: number, max: number): Promise<number>;

  zRevRank(key: string, member: string | Buffer | number): Promise<number | null>;

  zRevRange(key: string, start: number, end: number): Promise<string[]>;

  zCard(key: string): Promise<number>;

  zRemRangeByRank(key: string, start: number, stop: number): Promise<number>;

  lPush(key: string, values: (string | Buffer | number)[]): Promise<any>;

  rPop(key: string): Promise<any>;

  rPopBulk(key: string, count: number): Promise<string[] | null>;

  lPopAll<T>(key: string): Promise<T[]>;

  multi(commands: Array<string | number | Buffer>[]): Promise<any>;

  flushDb(): Promise<void>;

  shutdown(): Promise<void>;

  ensureOperationAllowed(): void;
}
