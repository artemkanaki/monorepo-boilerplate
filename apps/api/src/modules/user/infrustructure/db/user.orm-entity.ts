import { OrmEntity } from '@lib/ddd';
import { Column, Entity } from 'typeorm';
import { KycStatus } from '../../interfaces';

@Entity({ name: 'users' })
export class UserOrmEntity extends OrmEntity {
  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  kycStatus: KycStatus;
}
