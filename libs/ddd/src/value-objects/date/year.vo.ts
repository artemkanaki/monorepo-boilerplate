import { DomainPrimitive, ValueObject } from '../../core';

export class YearVo extends ValueObject<number> {
  constructor(year: number);
  constructor(year: string);
  constructor(year: number | string) {
    const value = typeof year === 'string' ? Number(year) : year;

    super({ value });
  }

  get value(): number {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<number>) {
    if (typeof props.value !== 'number') {
      throw new Error('value should be a number');
    }
    if (props.value < 1970 || props.value > 9999) {
      throw new Error('value should be between 1970 and 9999');
    }
  }
}
