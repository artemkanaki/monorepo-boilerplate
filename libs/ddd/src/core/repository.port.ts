import { QueryOperator } from '../db';
import { IdVo } from '../value-objects';
import { DomainEntityProps } from './domain-entity';

/*  Most of the repositories will probably need generic
    save/find/delete operations, so it's easier
    to have some shared interfaces.
    More specific interfaces should be defined
    in a respective module/use case.
*/

export type ExtendedQueryParams<Query> = {
  [key in keyof (Query & DomainEntityProps)]?: (Query & DomainEntityProps)[key] | QueryOperator;
};

export enum RowLevelLock {
  /** PG: FOR SHARE */
  PessimisticRead = 'PESSIMISTIC_READ',
  /** PG: FOR UPDATE */
  PessimisticWrite = 'PESSIMISTIC_WRITE',
  /** PG: FOR UPDATE SKIP LOCKED */
  PessimisticPartialWrite = 'PESSIMISTIC_PARTIAL_WRITE',
  /** PG: FOR UPDATE NOWAIT */
  PessimisticWriteOrFail = 'PESSIMISTIC_WRITE_OR_FAIL',
  /** PG: FOR NO KEY UPDATE */
  ForNoKeyUpdate = 'FOR_NO_KEY_UPDATE',
}

export interface IFindOneOptions<Relations> {
  relations?: Relations[];
  lock?: RowLevelLock;
}

export interface IFindOptions<Relations> extends IFindOneOptions<Relations> {
  limit?: number;
  offset?: number;
  orderBy?: OrderBy;
}

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface OrderBy {
  [key: string]: 'ASC' | 'DESC' | OrderDirection;
}

export interface PaginationMeta {
  limit?: number;
  page?: number;
  offset?: number;
}

export interface FindManyPaginatedParams<Filters, Relations> extends IFindOneOptions<Relations> {
  params?: ExtendedQueryParams<Filters>;
  pagination?: PaginationMeta;
  orderBy?: OrderBy;
  lock?: RowLevelLock;
}

export interface DataWithPaginationMeta<T> {
  data: T;
  count: number;
  limit?: number;
  page?: number;
}

// TODO: use IFindOneOptions?
export interface IScanOptions<Filters, Relations> extends IFindOneOptions<Relations> {
  params?: ExtendedQueryParams<Filters>;
  batchSize?: number;
}

export interface IModifyOptions {
  /**
   * If true, the entity events won't be emitted after applying changes. Think twice before using this option.
   */
  skipEventsEmit?: boolean;
}

export interface IRepositoryPort<Entity, Filters, Relations extends string | void = void> {
  save(entity: Entity, options?: IModifyOptions): Promise<Entity>;
  saveMultiple(entities: Entity[], options?: IModifyOptions): Promise<Entity[]>;
  count(params?: ExtendedQueryParams<Filters>): Promise<number>;
  findOne(params: ExtendedQueryParams<Filters>, options?: IFindOneOptions<Relations>): Promise<Entity | undefined>;
  findOneOrThrow(params: ExtendedQueryParams<Filters>, options?: IFindOneOptions<Relations>): Promise<Entity>;
  findOneByIdOrThrow(id: IdVo, options?: IFindOneOptions<Relations>): Promise<Entity>;
  findMany(params: ExtendedQueryParams<Filters>, options?: IFindOptions<Relations>): Promise<Entity[]>;
  findManyPaginated(options: FindManyPaginatedParams<Filters, Relations>): Promise<DataWithPaginationMeta<Entity[]>>;
  scan(
    callback: (entities: Entity[]) => void | Promise<void>,
    options?: IScanOptions<Filters, Relations>,
  ): Promise<void>;
  delete(entity: Entity, options?: IModifyOptions): Promise<Entity>;
  deleteMultiple(entities: Entity[], options?: IModifyOptions): Promise<Entity[]>;
  runTransaction<T>(handler: () => Promise<T>): Promise<T>;
}
