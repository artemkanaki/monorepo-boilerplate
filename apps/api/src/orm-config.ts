import './env';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const connectionSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  entities: [resolve(__dirname, './modules/**/*.orm-entity.{ts,js}')],
  migrations: [resolve(__dirname, 'migrations/*.{ts,js}')],
  migrationsTransactionMode: 'each',
  migrationsTableName: 'migrations',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  migrationsRun: process.env.DB_LOGGING === 'true',
  namingStrategy: new SnakeNamingStrategy(),
  logging: false,
});
