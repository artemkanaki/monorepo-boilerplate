import { DomainPrimitive, ValueObject } from '../core';
import { isEmail } from 'class-validator';
import { ArgumentInvalidError } from '../errors';
import { Env } from '@lib/common';

export class EmailVo extends ValueObject<string> {
  constructor(email: string) {
    super({ value: EmailVo.normalize(email) });
  }

  get value(): string {
    return this.props.value;
  }

  public static normalize(email: string) {
    if (process.env.NODE_ENV === Env.PROD) {
      // to lower case and remove everything after + sign:
      // JohnDoe+test@gmail.com -> johndoe@gmail.com
      return email.toLowerCase().replace(/\+.+@/, '@');
    }

    // to ease testing on dev and test environments we don't remove the part after + sign
    // so that we can create and test multiple accounts with the same base email
    return email.toLowerCase();
  }

  public static isEmail(value: string) {
    return isEmail(value);
  }

  protected validate({ value }: DomainPrimitive<string>) {
    if (!EmailVo.isEmail(value)) {
      throw new ArgumentInvalidError('Email is invalid');
    }
  }
}
