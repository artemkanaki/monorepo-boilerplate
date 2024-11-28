import { BaseError } from './base.error';

export interface IForbiddenPayload {
  message?: string;
  details?: string;
  code?: string;
}

export class ForbiddenError extends BaseError {
  constructor({ code, details, message }: IForbiddenPayload = {}) {
    super({
      message: message || 'Request cannot be processed due to insufficient permissions',
      code: code || 'GENERIC.FORBIDDEN',
      status: 403,
      data: {
        details,
      },
    });
  }
}
