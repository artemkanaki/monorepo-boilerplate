import { DomainPrimitive, ValueObject } from '../../core';

export class DayVo extends ValueObject<number> {
  constructor(day: number);
  constructor(day: string);
  constructor(day: number | string) {
    const value = typeof day === 'string' ? Number(day) : day;

    super({ value });
  }

  get value(): number {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<number>) {
    if (typeof props.value !== 'number') {
      throw new Error('value should be a number');
    }
    if (props.value < 1 || props.value > 31) {
      throw new Error('value should be between 1 and 31');
    }
  }
}
