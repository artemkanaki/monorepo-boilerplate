import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Env, ILoggerPort, LOGGER } from '@lib/common';
import { MainExceptionFilter } from './main-exception.filter';
import { ContextInterceptor } from './context.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

export interface IAppSetupOptions {
  env: Env;
  serviceName: string;
  servicePort: number;
  serviceHost: string;
  serviceSwaggerUrl: string;
}

export async function launchApp<T extends INestApplication>(app: T, options: IAppSetupOptions): Promise<T> {
  const logger = app.get<symbol, ILoggerPort>(LOGGER);

  process
    .on('unhandledRejection', (error: Error) =>
      logger.critical(`Unhandled rejection occurred: ${error?.message}`, error),
    )
    .on('uncaughtException', (error: Error) => logger.critical(`Uncaught error occurred: ${error?.message}`, error));

  if (options.env === Env.DEV) {
    process.on('warning', (error: Error) => logger.warn('Node warning', error));
  }

  app.useLogger(logger);
  app.useGlobalInterceptors(new ContextInterceptor());
  app.useGlobalFilters(new MainExceptionFilter(logger));
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  app.use(cookieParser());

  if (options.env !== Env.PROD) {
    const documentBuilder = new DocumentBuilder()
      .setTitle(options.serviceName || 'unknown')
      .setDescription(`${options.serviceName} description`)
      .addBearerAuth()
      .setVersion('v1');
    if (options.serviceSwaggerUrl) {
      // single url, or comma separated list (local, dev, prod)
      options.serviceSwaggerUrl.split(',').forEach((url) => {
        documentBuilder.addServer(url.trim());
      });
    }

    const config = documentBuilder.build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, { customSiteTitle: `${options.serviceName} - OpenAPI` });
  }

  await app.listen(options.servicePort || 3000, options.serviceHost || '0.0.0.0');

  return app;
}
