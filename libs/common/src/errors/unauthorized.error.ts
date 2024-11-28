import { BaseError } from './base.error';

export interface IUnauthorizedPayload {
  message?: string;
  details?: string;
  code?: string;
}

export class UnauthorizedError extends BaseError {
  constructor({ code, details, message }: IUnauthorizedPayload = {}) {
    super({
      message:
        message ||
        'Request cannot be processed due to invalid authentication credentials. Auth token is missing or expired',
      code: code || 'GENERIC.UNAUTHORIZED',
      status: 401,
      data: {
        details,
      },
    });
  }
}
