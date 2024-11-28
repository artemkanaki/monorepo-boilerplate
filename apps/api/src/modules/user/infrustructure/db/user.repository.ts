import { DbRepository, ValueObject } from '@lib/ddd';
import { UserEntity } from '../../domain';
import { IUserFilters, IUserRepositoryPort } from '../../interfaces';
import { UserOrmEntity } from './user.orm-entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityManager } from 'typeorm';
import { Inject } from '@nestjs/common';
import { LOGGER } from '@lib/common';
import { LoggerService } from '@lib/logger';
import { UserMapper } from './user.mapper';

export class UserRepository
  extends DbRepository<UserEntity, IUserFilters, UserOrmEntity>
  implements IUserRepositoryPort
{
  // TODO: remove this constructor and use injections in DbRepository. make mapper and relations abstract props
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    eventEmitter: EventEmitter2,
    @Inject(LOGGER) logger: LoggerService,
  ) {
    super(entityManager, eventEmitter, logger, UserOrmEntity, new UserMapper(), []);
  }

  // TODO: add autoparsing of plain VOs
  protected convertFiltersToRaw(filters: IUserFilters): any {
    const raw = {} as any;

    if (filters.email) {
      raw.email = ValueObject.isValueObject(filters.email) ? filters.email.value : filters.email;
    }

    return raw;
  }
}
