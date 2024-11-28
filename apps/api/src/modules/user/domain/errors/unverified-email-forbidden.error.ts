import { ForbiddenError } from '@lib/common';

export class UnverifiedEmailForbiddenError extends ForbiddenError {
  constructor() {
    super({
      code: 'AUTH.UNVERIFIED_EMAIL_FORBIDDEN',
      details: 'Action cannot be performed on an unverified email',
    });
  }
}
