import { DomainPrimitive, ValueObject } from '../../core';

export class SecondsVo extends ValueObject<number> {
  constructor(seconds: number);
  constructor(seconds: string);
  constructor(seconds: number | string) {
    const value = typeof seconds === 'string' ? Number(seconds) : seconds;

    super({ value });
  }

  get value() {
    return this.props.value;
  }

  public add(minute: SecondsVo) {
    return new SecondsVo(this.value + minute.value);
  }

  protected validate(props: DomainPrimitive<number>) {
    if (!Number.isInteger(props.value)) {
      throw new Error('Second value should be an integer');
    }
    if (props.value < 0) {
      throw new Error('Second value cannot be less then 0');
    }
  }
}
