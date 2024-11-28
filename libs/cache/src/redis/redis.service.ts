import { Inject, Injectable } from '@nestjs/common';

import { AbstractRedisService } from './abstract.redis.service';
import { CACHE_MODULE_OPTIONS } from '../di.constants';
import { CacheOptions } from '../interfaces';

@Injectable()
export class RedisService extends AbstractRedisService {
  constructor(
    @Inject(CACHE_MODULE_OPTIONS)
    options: CacheOptions,
  ) {
    super(options);
  }
}
