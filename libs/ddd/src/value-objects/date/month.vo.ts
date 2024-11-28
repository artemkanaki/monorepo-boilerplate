import { DomainPrimitive, ValueObject } from '../../core';

export class MonthVo extends ValueObject<number> {
  constructor(month: number);
  constructor(month: string);
  constructor(month: number | string) {
    const value = typeof month === 'string' ? Number(month) : month;

    super({ value });
  }

  /**
   * Returns month in 1-12 format
   * @returns {number}
   */
  get value(): number {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<number>) {
    if (typeof props.value !== 'number') {
      throw new Error('value should be a number');
    }
    if (props.value < 1 || props.value > 12) {
      throw new Error('value should be between 1 and 12');
    }
  }
}
