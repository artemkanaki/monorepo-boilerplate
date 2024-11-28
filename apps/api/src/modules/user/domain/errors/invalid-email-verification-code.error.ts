import { BadRequestError } from '@lib/common';

export class InvalidEmailVerificationCodeError extends BadRequestError {
  constructor() {
    super({
      code: 'AUTH.INVALID_EMAIL_VERIFICATION_CODE',
      details: 'Invalid email verification code',
    });
  }
}
