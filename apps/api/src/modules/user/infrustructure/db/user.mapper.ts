import { DateVo, DbMapper, EmailVo, IdVo, OrmEntityProps } from '@lib/ddd';
import { IUserConstructorProps, UserEntity } from '../../domain';
import { UserOrmEntity } from './user.orm-entity';

export class UserMapper extends DbMapper<UserEntity, UserOrmEntity> {
  constructor() {
    super(UserEntity, UserOrmEntity);
  }

  protected toDomainProps(ormEntity: UserOrmEntity): IUserConstructorProps {
    return {
      id: new IdVo(ormEntity.id),
      email: new EmailVo(ormEntity.email),
      kycStatus: ormEntity.kycStatus,
      createdAt: new DateVo(ormEntity.createdAt),
      updatedAt: new DateVo(ormEntity.updatedAt),
    };
  }

  protected toOrmProps(domainEntity: UserEntity): OrmEntityProps<UserOrmEntity> {
    return {
      email: domainEntity.email.value,
      kycStatus: domainEntity.kycStatus,
    };
  }
}
