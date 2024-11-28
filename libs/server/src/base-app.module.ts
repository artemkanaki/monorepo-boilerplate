import { MiddlewareConsumer } from '@nestjs/common';
import { ContextMiddleware } from './context.middleware';

export abstract class BaseAppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}
