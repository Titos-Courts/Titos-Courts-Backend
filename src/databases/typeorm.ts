import fs from 'fs';
import path from 'path';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { DatabaseError } from '../exceptions/database-error';
import { LoggerService } from '../services/logger-service';

let typeORMDB: DataSource;

export default async function typeORMConnect(): Promise<void> {
  LoggerService.getInstance().logGeneral(
    `Connecting to the database... ${process.env.DB_TYPE}`,
    'database'
  );
  let sqliteDbPath = path.resolve(
    `${process.env.DB_PATH}/better-sql/sqlite.db`
  );
  const doesSqliteDbExist = fs.existsSync(sqliteDbPath) || false;
  LoggerService.getInstance().logGeneral(
    `SQLite DB Path: ${sqliteDbPath}`,
    'database'
  );

  const dataSource = new DataSource({
    type: process.env.DB_TYPE as any,
    host: process.env.DB_TYPE === 'postgres' ? process.env.DB_HOST : undefined,
    port:
      process.env.DB_TYPE === 'postgres'
        ? Number(process.env.DB_PORT)
        : undefined,
    username:
      process.env.DB_TYPE === 'postgres' ? process.env.DB_USER : undefined,
    password:
      process.env.DB_TYPE === 'postgres' ? process.env.DB_PASSWORD : undefined,
    database:
      process.env.DB_TYPE === 'postgres'
        ? process.env.DB_DATABASE
        : sqliteDbPath,
    schema:
      process.env.DB_TYPE === 'postgres' ? process.env.DB_SCHEMA : undefined,
    entities: [`${__dirname}/entity/*.js`, `${__dirname}/entity/*.ts`],
    logging: false,
    synchronize:
      process.env.DB_TYPE === 'better-sqlite3' && !doesSqliteDbExist
        ? true
        : false,
  });
  LoggerService.getInstance().logGeneral(
    'Initializing the data source...',
    'database'
  );
  typeORMDB = await dataSource.initialize();
  LoggerService.getInstance().logGeneral(
    'Data source initialized successfully!',
    'database'
  );
}

// Executes TypeORM query for the provided entity model
export function useTypeORM(
  entity: EntityTarget<ObjectLiteral>
): Repository<ObjectLiteral> {
  if (!typeORMDB) {
    throw new DatabaseError( 'app', 'TypeORM has not been initialized!');
  }

  return typeORMDB.getRepository(entity);
}

export function getColumnJsonType(): 'json' | 'jsonb' {
  return process.env.DB_TYPE === 'postgres' ? 'jsonb' : 'json';
}
