import { Module } from '@nestjs/common';
import { BaseAppModule } from '@lib/server';
import { HealthModule } from './modules/health';
import { LoggerModule } from '@lib/logger';
import { connectionSource } from './orm-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user';
import { CacheModule } from '@lib/cache';
import * as process from 'node:process';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './modules/auth';

@Module({
  imports: [
    LoggerModule,
    EventEmitterModule.forRoot(),
    CacheModule.forRootAsync({
      imports: [],
      isGlobal: true,
      useFactory: async () => ({
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_AUTH!,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        db: Number(process.env.REDIS_DB),
      }),
    }),
    TypeOrmModule.forRoot(connectionSource.options),
    AuthModule,
    HealthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule extends BaseAppModule {}
