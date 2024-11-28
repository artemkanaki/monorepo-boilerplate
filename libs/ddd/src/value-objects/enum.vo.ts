import { ValueObject } from '../core';

interface EnumProps<Value> {
  value: Value;
  type: object;
}

/**
 * @example new EnumVo(2, ChainIdEnum)
 */
export class EnumVo<Value extends string | number> extends ValueObject<EnumProps<Value>> {
  constructor(value: Value, type: object) {
    super({ value, type });
  }

  public get value(): Value {
    return this.props.value;
  }

  public get type(): object {
    return this.props.type;
  }

  public static acceptedValues(type: object): string[] {
    return Object.values(type);
  }

  protected validate({ value, type }: EnumProps<Value>): void {
    if (value === undefined) {
      throw new Error('Enum value is required');
    }
    if (!EnumVo.acceptedValues(type).includes(String(value))) {
      throw new Error('Invalid enum value');
    }
  }
}
