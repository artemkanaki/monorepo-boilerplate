import { EmailVo, IRepositoryPort } from '@lib/ddd';
import { UserEntity } from '../domain';

export interface IUserFilters {
  email: EmailVo;
}

export interface IUserRepositoryPort extends IRepositoryPort<UserEntity, IUserFilters> {}
