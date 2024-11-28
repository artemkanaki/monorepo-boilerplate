import { BaseError } from './base.error';

export interface IInternalServerErrorPayload {
  message?: string;
  details?: string;
  code?: string;
}

export class InternalServerError extends BaseError {
  constructor({ code, details, message }: IInternalServerErrorPayload = {}) {
    super({
      message: message || 'Unexpected error occurred',
      code: code || 'GENERIC.INTERNAL_SERVER_ERROR',
      status: 500,
      data: {
        details,
      },
    });
  }
}
