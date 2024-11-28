import { ValueObject } from '../../core';
import { DateVo } from './date.vo';

export interface ITimeProps {
  hours: number;
  minutes: number;
}

const MINUTES_IN_ONE_DAY = 60 * 24;

export class TimeVo extends ValueObject<ITimeProps> {
  constructor(time: string | ITimeProps | DateVo) {
    let props: ITimeProps;
    if (typeof time === 'string') {
      const [hoursRaw, minutesRaw] = time.split(':');
      props = {
        hours: Number(hoursRaw),
        minutes: Number(minutesRaw),
      };
    } else if (time instanceof DateVo) {
      props = {
        hours: time.getHours(),
        minutes: time.getMinutes(),
      };
    } else {
      props = time;
    }

    super(props);
  }

  get hours() {
    return this.props.hours;
  }

  get minutes() {
    return this.props.minutes;
  }

  private static fromMinutes(input: number) {
    let minutes: number = 0;
    if (input >= MINUTES_IN_ONE_DAY) {
      minutes = input % MINUTES_IN_ONE_DAY;
    }
    if (input < 0) {
      if (input < MINUTES_IN_ONE_DAY * -1) {
        minutes = input % MINUTES_IN_ONE_DAY;
      }

      minutes = MINUTES_IN_ONE_DAY + input;
    }

    return new TimeVo({
      hours: Math.floor(input / 60),
      minutes: minutes % 60,
    });
  }

  getFormatted() {
    return `${this.props.hours.toString().padStart(2, '0')}:${this.props.minutes.toString().padStart(2, '0')}`;
  }

  convertToMinutes() {
    return this.hours * 60 + this.minutes;
  }

  addMinutes(minutes: number) {
    const timeInMinutes = this.hours * 60 + this.minutes + minutes;

    return TimeVo.fromMinutes(timeInMinutes);
  }

  gt(compareTo: TimeVo) {
    return this.convertToMinutes() > compareTo.convertToMinutes();
  }

  gte(compareTo: TimeVo) {
    return this.convertToMinutes() >= compareTo.convertToMinutes();
  }

  lt(compareTo: TimeVo) {
    return this.convertToMinutes() < compareTo.convertToMinutes();
  }

  lte(compareTo: TimeVo) {
    return this.convertToMinutes() <= compareTo.convertToMinutes();
  }

  protected validate({ hours, minutes }: ITimeProps) {
    if (hours < 0 || hours > 23) {
      throw new Error('Hours value is out of range');
    }
    if (minutes < 0 || minutes > 59) {
      throw new Error('Minutes value is out of range');
    }
  }
}
