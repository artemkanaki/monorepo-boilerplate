import BigNumber from 'bignumber.js';
import { ValueObject } from '../core';
import { ArgumentInvalidError, ArgumentInvalidTypeError } from '../errors';
import { PercentVo } from './percent.vo';

interface IMoneyProps {
  value: BigNumber;
}

/**
 * Money value object
 * It should be used for money operations and calculations and payments. It accepts money amount with 2 decimal places.
 * Otherwise, it throws an error.
 */
export class MoneyVo extends ValueObject<IMoneyProps> {
  // ninety-nine million nine hundred ninety-nine thousand nine hundred ninety-nine and ninety-nine cents
  public static readonly maxMoneyAmount = '9999999999';

  constructor(value: string | number | BigNumber) {
    if (typeof value !== 'string' && typeof value !== 'number' && !BigNumber.isBigNumber(value)) {
      throw new ArgumentInvalidTypeError('value', String);
    }

    super({
      value: BigNumber.isBigNumber(value) ? value : new BigNumber(value),
    });
  }

  /**
   * return money amount
   * @returns {number}
   */
  public get value(): number {
    return this.props.value.toNumber();
  }

  /**
   * Returns MoneyVo instance from money representation in cents
   * @param {number} amount
   * @returns {MoneyVo}
   */
  public static fromCents(amount: number) {
    return new MoneyVo(new BigNumber(amount).div(100));
  }

  public static createZero() {
    return new MoneyVo('0.00');
  }

  public isZero() {
    return this.value === 0;
  }

  public toFormatted() {
    return this.props.value.toFormat(2, { decimalSeparator: '.' });
  }

  public toCents() {
    return this.props.value.multipliedBy(100).integerValue(BigNumber.ROUND_FLOOR).toNumber();
  }

  public toBigNumber() {
    return this.props.value;
  }

  public add(amount: MoneyVo | number | string) {
    return new MoneyVo(this.props.value.plus(this.extractValue(amount)).decimalPlaces(2));
  }

  public subtract(amount: MoneyVo | number | string) {
    return new MoneyVo(this.props.value.minus(this.extractValue(amount)).decimalPlaces(2));
  }

  public percent(percent: PercentVo) {
    return MoneyVo.fromCents(
      this.props.value.multipliedBy(percent.getMultiplier()).integerValue(BigNumber.ROUND_CEIL).toNumber(),
    );
  }

  protected validate(props: IMoneyProps): void {
    if (props.value.isNaN()) {
      throw new ArgumentInvalidError('Invalid value');
    }
    if (props.value.isNegative()) {
      throw new ArgumentInvalidError('Money amount cannot be less than 0');
    }

    const fracture = props.value.modulo(1);
    if (fracture.gte(99)) {
      throw new ArgumentInvalidError(
        `Invalid value. Fracture part must be less then 99. Provided value: ${fracture.toNumber()}`,
      );
    }
  }

  private extractValue(value: MoneyVo | number | string): number | string {
    return typeof value === 'number' || typeof value === 'string' ? value : value.value;
  }
}
