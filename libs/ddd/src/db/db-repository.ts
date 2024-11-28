import { ContextMissingError, ContextService } from '@lib/context';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { set } from 'lodash';
import { EntityManager, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import {
  DataWithPaginationMeta,
  DomainAggregate,
  DomainEntity,
  ExtendedQueryParams,
  FindManyPaginatedParams,
  IFindOneOptions,
  IFindOptions,
  IModifyOptions,
  IRepositoryPort,
  IScanOptions,
  RowLevelLock,
  ValueObject,
} from '../core';
import { ArgumentInvalidError } from '../errors';
import { Constructable } from '../interfaces';
import { DateVo, IdVo } from '../value-objects';
import { DbMapper } from './db-mapper';
import { QueryOperator } from './query-operator';
import { ILoggerPort, NotFoundError } from '@lib/common';

type TypeOrmRowLock =
  | 'pessimistic_read'
  | 'pessimistic_write'
  | 'dirty_read'
  | 'pessimistic_partial_write'
  | 'pessimistic_write_or_fail'
  | 'for_no_key_update';

export type WhereCondition<OrmEntity> = FindOptionsWhere<OrmEntity>;

export type RawFilterTypes = string | number | boolean | Date | QueryOperator;

export type RawFilters<Entity> = Record<keyof Entity | string, RawFilterTypes>;

const DEFAULT_SCAN_BATCH_SIZE = 100;

export abstract class DbRepository<
  // biome-ignore lint/suspicious/noExplicitAny: cannot be replaced by anything else
  Entity extends DomainEntity<any>,
  Filters,
  OrmEntity extends ObjectLiteral,
  Relation extends string | void = void,
> implements IRepositoryPort<Entity, Filters, Relation>
{
  protected constructor(
    private readonly _manager: EntityManager,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly logger: ILoggerPort,
    protected readonly entity: Constructable<OrmEntity>,
    protected readonly mapper: DbMapper<Entity, OrmEntity>,
    protected readonly requiredRelationFields: string[],
    protected readonly relationToTableMap: Relation extends string ? Record<Relation, string | string[]> : void,
  ) {
    this.tableName = _manager.getRepository(entity).metadata.tableName;
    this.entityName = entity.name;
  }

  protected readonly tableName: string;
  protected readonly entityName: string;

  get manager(): EntityManager {
    const contextManager = ContextService.hasContext() ? ContextService.getTransactionManager() : undefined;

    // try to get transaction manager from context service, then from the repository
    return contextManager || this._manager;
  }

  get repository(): Repository<OrmEntity> {
    return this.manager.getRepository(this.entity);
  }

  public getMetadata() {
    if (typeof this.repository.target === 'string') {
      throw new Error('repository.target is string!');
    }

    const { ormEntityConstructor, entityConstructor } = this.mapper.getMetadata();

    return {
      entityConstructor,
      ormEntityConstructor,
      tableName: this.tableName,
      mapper: this.mapper,
    };
  }

  public async save(entity: Entity, options?: IModifyOptions): Promise<Entity> {
    if (!entity.updated && !entity.created) {
      const publishStartedAt = DateVo.now();

      this.logger.debug(`[Entity persisting skipped]: ${this.entityName} ${entity.id.value}`, 'save');

      if (entity instanceof DomainAggregate && !options?.skipEventsEmit) {
        await entity.publishEvents(this.eventEmitter);

        const eventsTookMs = DateVo.now().diff(publishStartedAt, 'millisecond');
        this.logger.debug(
          `[Entity events published]: ${this.entityName} ${entity.id.value} in ${eventsTookMs}ms`,
          'save',
        );
      }

      return entity;
    }

    entity.beforeSave();
    // hotfix for https://github.com/typeorm/typeorm/issues/2331
    const ormEntity = this.replaceUndefinedWithNull(this.mapper.toOrmEntity(entity));

    const upsertStartedAt = DateVo.now();

    const result = await this.upsert(ormEntity as OrmEntity);

    const upsertTookMs = DateVo.now().diff(upsertStartedAt, 'millisecond');

    this.logger.debug(`[Entity persisted]: ${this.entityName} ${entity.id.value} in ${upsertTookMs}ms`, 'save');

    if (entity instanceof DomainAggregate && !options?.skipEventsEmit) {
      const publishStartedAt = DateVo.now();
      await entity.publishEvents(this.eventEmitter);

      const eventsTookMs = DateVo.now().diff(publishStartedAt, 'millisecond');
      this.logger.debug(
        `[Entity events published]: ${this.entityName} ${entity.id.value} in ${eventsTookMs}ms`,
        'save',
      );
    }

    return this.mapper.toDomainEntity(result);
  }

  public async saveMultiple(entities: Entity[], options?: IModifyOptions): Promise<Entity[]> {
    const ormEntities: OrmEntity[] = [];
    for (const entity of entities) {
      if (!entity.updated && !entity.created) {
        this.logger.debug(`[Entity persisting skipped]: ${this.entityName} in ${entity.id.value}ms`, 'saveMultiple');

        if (entity instanceof DomainAggregate && !options?.skipEventsEmit) {
          await entity.publishEvents(this.eventEmitter);
        }

        continue;
      }

      entity.beforeSave();
      // hotfix for https://github.com/typeorm/typeorm/issues/2331
      const ormEntity = this.replaceUndefinedWithNull(this.mapper.toOrmEntity(entity));

      ormEntities.push(ormEntity);
    }

    if (ormEntities.length === 0) {
      return entities;
    }

    const upsertStartedAt = DateVo.now();

    const result = await this.upsertMany(ormEntities);

    const upsertTookMs = DateVo.now().diff(upsertStartedAt, 'millisecond');
    this.logger.debug(
      `[Multiple entities persisted]: ${entities.length} ${this.entityName} in ${upsertTookMs}ms`,
      'saveMultiple',
    );

    if (!options?.skipEventsEmit) {
      const publishStartedAt = DateVo.now();

      await Promise.all(
        entities.map(async (entity) => {
          if (entity instanceof DomainAggregate) {
            await entity.publishEvents(this.eventEmitter);
          }
        }),
      );

      const eventsTookMs = DateVo.now().diff(publishStartedAt, 'millisecond');
      this.logger.debug(
        `[Multiple entities events published]: ${entities.length} ${this.entityName} in ${eventsTookMs}ms`,
        'saveMultiple',
      );
    }

    return result.map((entity) => this.mapper.toDomainEntity(entity));
  }

  public async count(params: ExtendedQueryParams<Filters> = {}): Promise<number> {
    const result = await this.repository.count({
      where: this.prepareQuery(params),
      relations: this.prepareRelations(),
    });

    return result;
  }

  public async findOne(
    params: ExtendedQueryParams<Filters> = {},
    options?: IFindOneOptions<Relation>,
  ): Promise<Entity | undefined> {
    const where = this.prepareQuery(params);

    const found = await this.repository.findOne({
      where,
      relations: this.prepareRelations(options),
      lock: this.convertToDriverCompatibleLock(options?.lock),
    });

    return found ? this.mapper.toDomainEntity(found) : undefined;
  }

  public async findOneOrThrow(
    params: ExtendedQueryParams<Filters> = {},
    options?: IFindOneOptions<Relation>,
  ): Promise<Entity> {
    const found = await this.findOne(params, options);
    if (!found) {
      const metadata = this.getMetadata();
      throw new NotFoundError({
        message: `${metadata.entityConstructor.name} not found`,
      });
    }

    return found;
  }

  public async findOneByIdOrThrow(id: IdVo, options?: IFindOneOptions<Relation>): Promise<Entity> {
    const found = await this.findOneOrThrow({ id } as ExtendedQueryParams<Filters>, options);

    return found;
  }

  public async findMany(
    params: ExtendedQueryParams<Filters> = {},
    options?: IFindOptions<Relation>,
  ): Promise<Entity[]> {
    const result = await this.repository.find({
      where: this.prepareQuery(params),
      relations: this.prepareRelations(options),
      skip: options?.offset ? Number(options.offset) : undefined,
      take: options?.limit ? Number(options.limit) : undefined,
      order: options?.orderBy as any,
      lock: this.convertToDriverCompatibleLock(options?.lock),
    });

    return result.map((item) => this.mapper.toDomainEntity(item));
  }

  public async findManyPaginated({
    params = {},
    pagination,
    orderBy,
    relations,
    lock,
  }: FindManyPaginatedParams<Filters, Relation>): Promise<DataWithPaginationMeta<Entity[]>> {
    const page = pagination?.page ? Number(pagination.page) : undefined;
    const limit = pagination?.limit ? Number(pagination.limit) : undefined;
    const offset = pagination?.offset ? Number(pagination.offset) : undefined;

    let skip: number | undefined;
    if (page && limit) {
      skip = (page - 1) * limit;
    } else if (offset) {
      skip = offset;
    }

    const [data, count] = await this.repository.findAndCount({
      skip,
      take: limit,
      where: this.prepareQuery(params),
      order: orderBy as any,
      relations: this.prepareRelations({ relations }),
      lock: this.convertToDriverCompatibleLock(lock),
    });

    const result: DataWithPaginationMeta<Entity[]> = {
      data: data.map((item) => this.mapper.toDomainEntity(item)),
      count,
      limit,
      page,
    };

    return result;
  }

  public async scan(callback: (entities: Entity[]) => void | Promise<void>, options?: IScanOptions<Filters, Relation>) {
    let endReached = false;
    let page = 1;
    const batchSize = options?.batchSize || DEFAULT_SCAN_BATCH_SIZE;
    while (!endReached) {
      const { data } = await this.findManyPaginated({
        pagination: {
          page,
          limit: batchSize,
        },
        params: options?.params,
        relations: options?.relations,
        lock: options?.lock,
      });
      page += 1;

      await callback(data);

      endReached = data.length < batchSize;
    }
  }

  public async delete(entity: Entity, options?: IModifyOptions): Promise<Entity> {
    await this.repository.remove(this.mapper.toOrmEntity(entity));
    this.logger.debug(`[Entity deleted]: ${this.entityName} ${entity.id.value}`, 'delete');

    if (entity instanceof DomainAggregate && !options?.skipEventsEmit) {
      await entity.publishEvents(this.eventEmitter);
    }

    return entity;
  }

  public async deleteMultiple(entities: Entity[], options?: IModifyOptions): Promise<Entity[]> {
    await this.repository.remove(entities.map((entity) => this.mapper.toOrmEntity(entity)));

    this.logger.debug(`[Multiple entities deleted]: ${entities.length} ${this.entityName}`, 'deleteMany');

    if (!options?.skipEventsEmit) {
      await Promise.all(
        entities.map((entity) =>
          entity instanceof DomainAggregate ? entity.publishEvents(this.eventEmitter) : Promise.resolve(),
        ),
      );
    }

    return entities;
  }

  public runTransaction<T>(handler: () => Promise<T>): Promise<T> {
    let context: typeof ContextService;
    if (ContextService.hasContext()) {
      context = ContextService;
    } else {
      throw new ContextMissingError('Cannot run transaction without context');
    }

    const contextId = context.getContextId();

    return this._manager.transaction(async (transactionalManager) => {
      this.logger.debug(`[${contextId}] transaction started`);

      if (context.getTransactionManager()) {
        throw new Error('Another transaction is already running. Nested transactions are not allowed.');
      }

      context.setTransactionManager(transactionalManager);

      try {
        const result = await handler();
        this.logger.debug(`[${contextId}] transaction committed`);
        return result;
      } catch (e) {
        this.logger.error(`[${contextId}] transaction failed`, e);
        throw e;
      } finally {
        context.clearTransactionManager();
      }
    });
  }

  // can be overwritten if an inheritor requires more complex logic
  protected upsert(entity: OrmEntity): Promise<OrmEntity> {
    return this.repository.save(entity as any);
  }

  // can be overwritten if an inheritor requires more complex logic
  protected upsertMany(entities: OrmEntity[]): Promise<OrmEntity[]> {
    return this.repository.save(entities as any);
  }

  protected prepareQuery(params: ExtendedQueryParams<Filters>): WhereCondition<OrmEntity> {
    const where = {} as WhereCondition<OrmEntity>;

    const baseRawFilters = {} as RawFilters<Entity>;
    if (params.id) {
      baseRawFilters.id = ValueObject.isValueObject(params.id) ? params.id.value : params.id;
    }
    if (params.createdAt) {
      baseRawFilters.createdAt = ValueObject.isValueObject(params.createdAt)
        ? params.createdAt.value
        : params.createdAt;
    }
    if (params.updatedAt) {
      baseRawFilters.updatedAt = ValueObject.isValueObject(params.updatedAt)
        ? params.updatedAt.value
        : params.updatedAt;
    }

    const rawFilters = {
      ...baseRawFilters,
      ...this.convertFiltersToRaw(params as ExtendedQueryParams<Filters>),
    };

    for (const [key, param] of Object.entries(rawFilters)) {
      if (param instanceof QueryOperator) {
        set(where as object, key, param.build());
      } else {
        set(where as object, key, param);
      }
    }

    return where;
  }

  protected prepareRelations(options?: IFindOneOptions<Relation>): string[] {
    if (options?.relations) {
      return [...(this.requiredRelationFields as string[]), ...this.convertRelationsToFieldNames(options?.relations)];
    }

    return this.requiredRelationFields as string[];
  }

  protected abstract convertFiltersToRaw(filters: ExtendedQueryParams<Filters>): RawFilters<OrmEntity>;

  protected convertToDriverCompatibleLock(
    lock: RowLevelLock | undefined,
  ): { mode: TypeOrmRowLock; tables: string[] } | undefined {
    if (!lock) {
      return;
    }

    switch (lock) {
      case RowLevelLock.PessimisticRead:
        return {
          mode: 'pessimistic_read',
          tables: [this.getMetadata().tableName],
        };
      case RowLevelLock.PessimisticWrite:
        return {
          mode: 'pessimistic_write',
          tables: [this.getMetadata().tableName],
        };
      case RowLevelLock.PessimisticPartialWrite:
        return {
          mode: 'pessimistic_partial_write',
          tables: [this.getMetadata().tableName],
        };
      case RowLevelLock.PessimisticWriteOrFail:
        return {
          mode: 'pessimistic_write_or_fail',
          tables: [this.getMetadata().tableName],
        };
      case RowLevelLock.ForNoKeyUpdate:
        return {
          mode: 'for_no_key_update',
          tables: [this.getMetadata().tableName],
        };
      default:
        return undefined;
    }
  }

  private convertRelationsToFieldNames(relations: Relation[]): string[] {
    return relations.reduce((fields: string[], relation: Relation) => {
      if (this.relationToTableMap) {
        const fieldName = this.relationToTableMap[relation as string];

        if (fieldName) {
          if (Array.isArray(fieldName)) {
            fields.push(...fieldName);
          }
          if (typeof fieldName === 'string') {
            fields.push(fieldName);
          }

          return fields;
        }
      }

      throw new ArgumentInvalidError(`Unknown relation "${relation}"`);
    }, []);
  }

  private replaceUndefinedWithNull(obj: any): any {
    for (const [key, value] of Object.entries(obj)) {
      if (obj[key] === undefined) {
        obj[key] = null;
      } else {
        obj[key] = value;
      }
    }

    return obj;
  }
}
