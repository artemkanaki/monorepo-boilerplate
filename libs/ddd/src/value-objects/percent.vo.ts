import BigNumber from 'bignumber.js';
import { ValueObject } from '../core';
import { ArgumentInvalidError } from '../errors';

export interface PercentVoProps {
  value: BigNumber;
}

export class PercentVo extends ValueObject<PercentVoProps> {
  constructor(value: number | string | BigNumber) {
    super({ value: new BigNumber(value) });
  }

  public get value(): number {
    return this.props.value.toNumber();
  }

  public static createZero(): PercentVo {
    return new PercentVo(0);
  }

  public isZero(): boolean {
    return this.props.value.toNumber() === 0;
  }

  public toFormatted(): string {
    return this.props.value.toFormat(2, { decimalSeparator: '.' });
  }

  public add(value: PercentVo | number | string): PercentVo {
    return new PercentVo(this.props.value.plus(this.toBigNumber(value)));
  }

  public subtract(value: PercentVo | number | string): PercentVo {
    return new PercentVo(this.props.value.minus(this.toBigNumber(value)));
  }

  public getMultiplier(): string {
    return this.props.value
      .multipliedBy(100)
      .integerValue(BigNumber.ROUND_CEIL)
      .div(10000)
      .toFormat({ decimalSeparator: '.' });
  }

  protected validate(props: PercentVoProps): void {
    if (props.value.isNaN()) {
      throw new ArgumentInvalidError('Invalid value');
    }
    if (props.value.isNegative()) {
      throw new ArgumentInvalidError('Percent amount cannot be less than 0');
    }
  }

  private toBigNumber(value: PercentVo | number | string): BigNumber {
    return ValueObject.isValueObject(value) ? value.props.value : new BigNumber(value);
  }
}
