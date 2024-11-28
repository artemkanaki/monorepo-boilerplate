import { DomainEntity } from '../core';
import { Constructable } from '../interfaces';
import { DateVo } from '../value-objects';

export type OrmEntityProps<OrmEntity> = Omit<OrmEntity, 'id' | 'createdAt' | 'updatedAt'>;

export abstract class DbMapper<Entity extends DomainEntity<any>, OrmEntity> {
  constructor(
    private readonly entityConstructor: Constructable<Entity>,
    private readonly ormEntityConstructor: Constructable<OrmEntity>,
  ) {}

  protected abstract toDomainProps(ormEntity: OrmEntity): unknown;
  protected abstract toOrmProps(entity: Entity): OrmEntityProps<OrmEntity>;

  public toDomainEntity(ormEntity: OrmEntity): Entity {
    const props = this.toDomainProps(ormEntity);

    return new this.entityConstructor(props);
  }

  public toOrmEntity(entity: Entity): OrmEntity {
    const props = this.toOrmProps(entity);
    const ormEntity = Object.assign(new this.ormEntityConstructor() as Record<string | number | symbol, unknown>, {
      ...props,
      id: entity.id.value,
      createdAt: entity.createdAt.value,
      updatedAt: entity.updated ? DateVo.now().value : entity.updatedAt.value, // update updatedAt only if entity was updated
    });

    return ormEntity as OrmEntity;
  }

  public getMetadata() {
    return {
      entityConstructor: this.entityConstructor,
      ormEntityConstructor: this.ormEntityConstructor,
    };
  }
}
