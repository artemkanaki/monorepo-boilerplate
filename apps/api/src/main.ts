import './env';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { launchApp } from '@lib/server';
import { AppModule } from './app.module';
import { Env } from '@lib/common';

if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV env variable is missing');
}
if (!Object.values(Env).includes(process.env.NODE_ENV as Env)) {
  throw new Error(
    `Invalid value in NODE_ENV. Allowed values ${Object.values(Env).join(', ')}, but got ${process.env.NODE_ENV}`,
  );
}
if (!process.env.SERVICE_NAME) {
  throw new Error('SERVICE_NAME env variable is missing');
}
if (!process.env.SERVICE_PORT) {
  throw new Error('SERVICE_PORT env variable is missing');
}
if (!process.env.SERVICE_HOST) {
  throw new Error('SERVICE_HOST env variable is missing');
}
if (!process.env.SERVICE_SWAGGER_URL) {
  throw new Error('SERVICE_SWAGGER_URL env variable is missing');
}

const env = process.env.NODE_ENV as Env;
const serviceName = process.env.SERVICE_NAME;
const servicePort = Number(process.env.SERVICE_PORT);
const serviceHost = process.env.SERVICE_HOST;
const serviceSwaggerUrl = process.env.SERVICE_SWAGGER_URL;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    abortOnError: false,
    bufferLogs: true,
    cors: {
      origin: [
        'http://localhost:8000',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    },
  });

  await launchApp(app, {
    env,
    serviceName,
    servicePort,
    serviceHost,
    serviceSwaggerUrl,
  });
}

bootstrap();
