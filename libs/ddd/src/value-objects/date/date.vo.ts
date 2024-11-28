import { DateTime } from 'luxon';
import { DateTimeUnit } from 'luxon/src/datetime';
import { DurationLike, DurationUnit } from 'luxon/src/duration';
import { ValueObject } from '../../core';
import { DayOfWeek } from './day-of-week';
import { DayVo } from './day.vo';
import { MonthVo } from './month.vo';
import { TimeVo } from './time.vo';
import { TimezoneVo } from './timezone.vo';
import { YearVo } from './year.vo';

interface IDateVoProps {
  date: DateTime<true>;
  timezone: TimezoneVo;
}

interface IDiffParams {
  compareTo: DateVo;
  unit: DurationUnit;
  /**
   * If true, returns absolute value of the difference.
   */
  abs?: boolean;
}

const MILLISECONDS_IN_SECOND = 1000;

export type DateTimeDuration = DurationLike;

export class DateVo extends ValueObject<IDateVoProps> {
  constructor(value: Date | string | number, timezone: TimezoneVo = TimezoneVo.createUtc()) {
    let date: DateTime;
    if (typeof value === 'string') {
      date = DateTime.fromISO(value, { zone: timezone.value });
    } else if (typeof value === 'number') {
      date = DateTime.fromMillis(value, { zone: timezone.value });
    } else {
      date = DateTime.fromJSDate(value, { zone: timezone.value });
    }

    super({
      date,
      timezone,
    });
  }

  public get value(): Date {
    return this.props.date.toJSDate();
  }

  public get iso(): string {
    const utcDate = this.props.date.setZone(TimezoneVo.createUtc().value);
    if (!this.isValidDateTime(utcDate)) {
      // This if exists to fix TS error. This never occurs.
      throw new Error('After conversion to UTC timezone date became invalid.');
    }

    return utcDate.toISO();
  }

  public get timezone(): TimezoneVo {
    return this.props.timezone;
  }

  private get date(): DateTime {
    return this.props.date;
  }

  public static now(): DateVo {
    return new DateVo(Date.now());
  }

  public static fromTzDate(date: string | Date, timezone: TimezoneVo): DateVo {
    return new DateVo(date, timezone).add({ minutes: timezone.getOffset() });
  }

  public static fromUnixTimestamp(timestamp: number): DateVo {
    return new DateVo(timestamp * MILLISECONDS_IN_SECOND);
  }

  /**
   * Changes timezone field value, and recalculates tz related fields. ISO value in field `value` remains the same.
   * @param {TimezoneVo} timezone
   * @returns {DateVo}
   */
  public setTimezone(timezone: TimezoneVo) {
    return new DateVo(this.value, timezone);
  }

  public getDayOfTheWeek(): DayOfWeek {
    switch (this.props.date.weekday) {
      case 1:
        return DayOfWeek.Mon;
      case 2:
        return DayOfWeek.Tue;
      case 3:
        return DayOfWeek.Wed;
      case 4:
        return DayOfWeek.Thu;
      case 5:
        return DayOfWeek.Fri;
      case 6:
        return DayOfWeek.Sat;
      case 7:
        return DayOfWeek.Sun;
      default:
        throw new Error('Invalid date');
    }
  }

  public getDay(): DayVo {
    return new DayVo(this.props.date.day);
  }

  public getWeek(): number {
    return this.props.date.weekNumber;
  }

  public getMonth(): MonthVo {
    return new MonthVo(this.props.date.month);
  }

  public getYear(): YearVo {
    return new YearVo(this.props.date.year);
  }

  public getHours(): number {
    return this.props.date.hour;
  }

  public getMinutes(): number {
    return this.props.date.minute;
  }

  public getMilliseconds(): number {
    return this.props.date.millisecond;
  }

  /**
   * Sets new time value
   * @param {TimeVo} time
   * @returns {DateVo}
   */
  public setTime(time: TimeVo) {
    return new DateVo(
      this.date
        .set({
          hour: time.hours,
          minute: time.minutes,
          second: 0,
          millisecond: 0,
        })
        .toJSDate(),
      this.props.timezone,
    );
  }

  /**
   * Returns time in TimeVo format
   * @returns {TimeVo}
   */
  public getTime() {
    return new TimeVo({
      hours: this.getHours(),
      minutes: this.getMinutes(),
    });
  }

  /**
   * Returns the number of milliseconds since the Unix Epoch
   * @returns {number}
   */
  public toMilliseconds() {
    return Number(this.value);
  }

  /**
   * Returns unix timestamp
   * @returns {number}
   */
  public toUnixTimestamp(): number {
    return Math.round(this.toMilliseconds() / 1000);
  }

  /**
   * Returns formatted date string
   * @param {string} format
   * @param {TimezoneVo} timezone
   * @returns {string}
   */
  public format(format: string, timezone: TimezoneVo = this.props.timezone): string {
    return this.props.date.setZone(timezone.value).toFormat(format);
  }

  /**
   * Returns a new DateVo with the given amount added
   * @param {DurationLike} amount
   * @returns {DateVo}
   */
  public add(amount: DurationLike) {
    return new DateVo(
      this.props.date.setZone(this.timezone.value).plus(amount).setZone(TimezoneVo.UTC_VALUE).toJSDate(),
      this.props.timezone,
    );
  }

  /**
   * Returns a new DateVo with the given amount subtracted
   * @param {DurationLike} amount
   * @returns {DateVo}
   */
  public subtract(amount: DurationLike) {
    return new DateVo(
      this.props.date.setZone(this.timezone.value).minus(amount).setZone(TimezoneVo.UTC_VALUE).toJSDate(),
      this.props.timezone,
    );
  }

  /**
   * Returns the start of the given unit of time
   * For example, if the date is 2014-01-15 12:00:00 and the unit is 'day', the result will be 2014-01-15 00:00:00
   * @param {DateTimeUnit} unit
   * @returns {DateVo}
   */
  public startOf(unit: DateTimeUnit) {
    return new DateVo(this.props.date.setZone(this.props.timezone.value).startOf(unit).toJSDate(), this.props.timezone);
  }

  /**
   * Returns the end of the given unit of time.
   * For example, if the date is 2014-01-15 12:00:00 and the unit is 'day', the result will be 2014-01-15 23:59:59.999
   * @param {DateTimeUnit} unit
   * @returns {DateVo}
   */
  public endOf(unit: DateTimeUnit) {
    return new DateVo(this.props.date.setZone(this.props.timezone.value).endOf(unit).toJSDate(), this.props.timezone);
  }

  /**
   * Returns the difference between the date of the instance and the date of the argument in the given unit
   * @param {DateVo} compareTo
   * @param {DurationUnit} unit
   * @returns {number}
   */
  public diff(compareTo: DateVo, unit: DurationUnit): number;
  /**
   * Returns the difference between the date of the instance and the date of the argument in the given unit
   * @param {IDiffParams} params
   */
  public diff(params: IDiffParams): number;
  public diff(params: DateVo | IDiffParams, unit?: DurationUnit): number {
    if (params instanceof DateVo) {
      if (!unit) {
        throw new Error('Unit is not provided');
      }

      return this.props.date.diff(params.date, unit).get(unit);
    }

    const diff = this.props.date.diff(params.compareTo.date, params.unit).get(params.unit);
    if (params.abs) {
      return Math.abs(diff);
    }

    return diff;
  }

  /**
   * Returns true if date of the instance is greater than date of the argument
   * @param {DateVo} compareTo
   * @returns {boolean}
   */
  public gt(compareTo: DateVo) {
    return this.date > compareTo.date;
  }

  /**
   * Returns true if date of the instance is greater than or equal to date of the argument
   * @param {DateVo} compareTo
   * @returns {boolean}
   */
  public gte(compareTo: DateVo) {
    return this.date >= compareTo.date;
  }

  /**
   * Returns true if date of the instance is less than date of the argument
   * @param {DateVo} compareTo
   * @returns {boolean}
   */
  public lt(compareTo: DateVo) {
    return this.date < compareTo.date;
  }

  /**
   * Returns true if date of the instance is less than or equal to date of the argument
   * @param {DateVo} compareTo
   * @returns {boolean}
   */
  public lte(compareTo: DateVo) {
    return this.date <= compareTo.date;
  }

  /**
   * Alias for gt. More understandable interface
   * @param {DateVo} compareTo
   * @returns {boolean}
   */
  public isAfter(compareTo: DateVo) {
    return this.gt(compareTo);
  }

  /**
   * Alias for gte. More understandable interface
   * @param {DateVo} compareTo
   * @returns {boolean}
   */
  public isAfterOrSame(compareTo: DateVo) {
    return this.gte(compareTo);
  }

  /**
   * Alias for lt. More understandable interface
   * @param {DateVo} compareTo
   * @returns {boolean}
   */
  public isBefore(compareTo: DateVo) {
    return this.lt(compareTo);
  }

  /**
   * Alias for lte. More understandable interface
   * @param {DateVo} compareTo
   * @returns {boolean}
   */
  public isBeforeOrSame(compareTo: DateVo) {
    return this.lte(compareTo);
  }

  /**
   * Returns true if date of the instance is greater than current date
   * @returns {boolean}
   */
  public isInFuture() {
    return this.gt(DateVo.now());
  }

  /**
   * Returns true if date of the instance is lesser than current date
   * @returns {boolean}
   */
  public isInPast() {
    return this.lt(DateVo.now());
  }

  /**
   * Clone the instance
   * @returns {DateVo}
   */
  public clone() {
    return new DateVo(this.date.toJSDate(), this.props.timezone);
  }

  protected validate({ date, timezone }: IDateVoProps): void {
    if (!(date instanceof DateTime)) {
      throw new Error('date should be instance of DateTime');
    }
    if (!date.isValid) {
      throw new Error(`Invalid date: ${date.invalidExplanation}`);
    }
    if (!timezone) {
      throw new Error('Invalid timezone');
    }
  }

  private isValidDateTime(date: DateTime): date is DateTime<true> {
    return date.isValid;
  }
}
