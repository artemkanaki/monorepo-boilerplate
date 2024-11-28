import { isEqual } from 'lodash';
import { convertPropsToObject, isObject } from './util';
import { Primitives } from './types';

export interface DomainPrimitive<T extends Primitives | Date> {
  value: T;
}

type ValueObjectProps<T> = T extends Primitives | Date ? DomainPrimitive<T> : T;

/**
 * Base class for Value Objects. ValueObject is an immutable object that is defined by its attributes.
 * Used to describe complex types such as money, date, email, phone number, etc.
 */
export abstract class ValueObject<T> {
  protected readonly props: ValueObjectProps<T>;

  constructor(props: ValueObjectProps<T>) {
    this.validate(props);
    this.props = props;
  }

  public static isValueObject(obj: unknown): obj is ValueObject<unknown> {
    return obj instanceof ValueObject;
  }

  /**
   *  Check if two Value Objects are equal. Checks structural equality.
   * @param vo ValueObject
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    return this === vo || isEqual(this.toObject(), vo.toObject());
  }

  /**
   * Get raw props object or value.
   */
  public toObject(): Primitives | Date | object {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value;
    }

    if (isObject(this.props)) {
      const propsCopy = convertPropsToObject(this.props);

      return Object.freeze(propsCopy);
    }

    // this line is unreachable
    throw new Error('ValueObject props contains invalid type.');
  }

  protected abstract validate(props: ValueObjectProps<T>): void;

  private isDomainPrimitive(obj: unknown): obj is DomainPrimitive<T & (Primitives | Date)> {
    if (
      typeof obj === 'object' &&
      obj !== null &&
      'value' in obj &&
      Object.keys(obj).length === 1 &&
      (['string', 'number', 'boolean'].includes(typeof obj.value) || obj.value instanceof Date)
    ) {
      return true;
    }

    return false;
  }
}
