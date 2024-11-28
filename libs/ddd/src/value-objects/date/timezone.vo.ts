import { DateTime } from 'luxon';
import { DomainPrimitive, ValueObject } from '../../core';
import { DateVo } from './date.vo';
import { VALID_TIMEZONE_NAMES } from './timezones';

export class TimezoneVo extends ValueObject<string> {
  constructor(value: string) {
    super({ value });
  }

  static UTC_VALUE = 'Etc/UTC';

  static createUtc() {
    return new TimezoneVo(TimezoneVo.UTC_VALUE);
  }

  get value(): string {
    return this.props.value;
  }

  public getOffset(date?: DateVo | Date): number {
    if (date) {
      const nativeDate = date instanceof DateVo ? date.value : date;
      const libraryDate = DateTime.fromJSDate(nativeDate);
      return libraryDate.setZone(this.props.value).offset * -1;
    }

    return DateTime.now().setZone(this.props.value).offset * -1;
  }

  protected validate({ value }: DomainPrimitive<string>) {
    if (!VALID_TIMEZONE_NAMES.includes(value)) {
      throw new Error('Provided value is not a timezone');
    }
  }
}
