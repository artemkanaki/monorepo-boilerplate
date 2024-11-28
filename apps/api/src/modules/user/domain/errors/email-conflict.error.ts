import { ConflictError } from '@lib/common';
import { EmailVo } from '@lib/ddd';

export class EmailConflictError extends ConflictError {
  constructor(email: EmailVo) {
    super({
      code: 'USER.EMAIL_CONFLICT',
      details: `Email ${email.value} already exists`,
    });
  }
}
