import { v4 as uuidV4, validate } from 'uuid';
import { DomainPrimitive, ValueObject } from '../core';
import { ArgumentInvalidError } from '../errors';

export class IdVo extends ValueObject<string> {
  constructor(value: string) {
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }

  /**
   *Returns new ID instance with randomly generated ID value
   * @static
   * @return {*}  {IdVo}
   * @memberof IdVo
   */
  static generate(): IdVo {
    return new IdVo(uuidV4());
  }

  static isUuid(value: string): boolean {
    return validate(value);
  }

  public getMinifiedValue(): string {
    return this.value.replace(/-/g, '');
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!IdVo.isUuid(value)) {
      throw new ArgumentInvalidError('Incorrect ID format');
    }
  }
}
