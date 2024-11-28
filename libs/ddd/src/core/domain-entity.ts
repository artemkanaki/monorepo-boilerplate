import { cloneDeep, isEqual, isEmpty } from 'lodash';
import { ArgumentInvalidError, ArgumentMissingError } from '../errors';
import { DateVo, IdVo } from '../value-objects';
import { convertPropsToObject } from './util';

export interface DomainEntityProps {
  id: IdVo;
  createdAt: DateVo;
  updatedAt: DateVo;
}

export type DomainEntityConstructorProps<EntityProps> = Omit<EntityProps, 'id' | 'createdAt' | 'updatedAt'> &
  Partial<DomainEntityProps>;

export abstract class DomainEntity<EntityProps extends DomainEntityProps> {
  private readonly _created: boolean;
  private readonly _id: IdVo;
  private readonly _createdAt: DateVo;
  private readonly _updatedAt: DateVo;
  private readonly _propsCopy: unknown;

  protected readonly props: EntityProps;

  constructor(props: DomainEntityConstructorProps<EntityProps>) {
    this.validateProps(props);

    if (props.id && props.createdAt && props.updatedAt) {
      this._id = props.id;
      this._createdAt = props.createdAt;
      this._updatedAt = props.updatedAt;

      this._created = false;
    } else {
      this._id = props.id || IdVo.generate();

      const now = DateVo.now();
      this._createdAt = now;
      this._updatedAt = now;

      props.id = this._id;
      props.createdAt = this._createdAt;
      props.updatedAt = this._updatedAt;

      this._created = true;
    }

    this.props = props as EntityProps;
    this._propsCopy = cloneDeep(this.toObject());
  }

  get id(): IdVo {
    return this._id;
  }

  get createdAt(): DateVo {
    return this._createdAt;
  }

  get updatedAt(): DateVo {
    return this._updatedAt;
  }

  get created(): boolean {
    return this._created;
  }

  get updated(): boolean {
    return !isEqual(this.toObject(), this._propsCopy);
  }

  static isEntity(entity: unknown): entity is DomainEntity<DomainEntityProps> {
    return entity instanceof DomainEntity;
  }

  /**
   *  Check if two entities are the same Entity. Checks using ID field.
   * @param object Entity
   */
  public equals(object?: DomainEntity<EntityProps>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!DomainEntity.isEntity(object)) {
      return false;
    }

    return this.id ? this.id.equals(object.id) : false;
  }

  /**
   * Convert to plain object. Mostly for debugging and testing purposes.
   */
  public toObject(): unknown {
    const propsCopy = convertPropsToObject(this.props);

    const result = {
      id: this._id.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt.value,
      ...propsCopy,
    };
    return Object.freeze(result);
  }

  /**
   * Before save hook
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public beforeSave(): void {}

  protected abstract validate(props: EntityProps): void;

  private validateProps(props: DomainEntityConstructorProps<EntityProps>) {
    const maxProps = 50;

    if (isEmpty(props)) {
      throw new ArgumentMissingError('Entity props should not be empty');
    }
    if (typeof props !== 'object') {
      throw new ArgumentInvalidError('Entity props should be an object');
    }
    if (Object.keys(props).length > maxProps) {
      throw new ArgumentInvalidError(`Entity props should not have more then ${maxProps} properties`);
    }

    this.validate(props as EntityProps);
  }
}
