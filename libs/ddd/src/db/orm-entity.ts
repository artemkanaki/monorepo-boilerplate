import { Column, PrimaryColumn } from 'typeorm';

export abstract class OrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;
}
