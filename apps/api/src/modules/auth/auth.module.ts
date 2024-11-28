import { AuthMiddleware, AuthService } from './infrastructure';
import { Global, MiddlewareConsumer, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
