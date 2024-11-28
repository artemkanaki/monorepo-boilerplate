import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LOGGER } from '@lib/common';

@Global()
@Module({
  controllers: [],
  providers: [{ useClass: LoggerService, provide: LOGGER }],
  exports: [{ useClass: LoggerService, provide: LOGGER }],
})
export class LoggerModule {}
