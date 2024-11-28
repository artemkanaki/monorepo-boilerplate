import { DomainPrimitive, ValueObject } from '../../core';

export class MinuteVo extends ValueObject<number> {
  constructor(minutes: number);
  constructor(minutes: string);
  constructor(minutes: number | string) {
    const value = typeof minutes === 'string' ? Number(minutes) : minutes;

    super({ value });
  }

  get value() {
    return this.props.value;
  }

  public add(minute: MinuteVo) {
    return new MinuteVo(this.value + minute.value);
  }

  protected validate(props: DomainPrimitive<number>) {
    if (!Number.isInteger(props.value)) {
      throw new Error('Minute value should be an integer');
    }
    if (props.value < 0) {
      throw new Error('Minute value cannot be less then 0');
    }
  }
}
