import { DynamicModule, Global, Module } from '@nestjs/common';

import { CACHE_MODULE_OPTIONS, CACHE_SERVICE } from './di.constants';
import { CacheModuleOptions } from './interfaces';
import { RedisService } from './redis';

@Global()
@Module({
  providers: [{ useClass: RedisService, provide: CACHE_SERVICE }],
  exports: [{ useClass: RedisService, provide: CACHE_SERVICE }],
})
export class CacheModule {
  static forRootAsync(options: CacheModuleOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: CacheModule,
      imports: options.imports || [],
      providers: [
        {
          provide: CACHE_MODULE_OPTIONS,
          useFactory: async (...args: any[]) => await options.useFactory?.(...args),
          inject: options.inject || [],
        },
      ],
    };
  }
}
