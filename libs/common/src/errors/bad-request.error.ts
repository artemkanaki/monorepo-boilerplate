import { BaseError } from './base.error';

export interface IBadRequestPayload {
  message?: string;
  details?: string;
  code?: string;
}

export class BadRequestError extends BaseError {
  constructor({ message, details, code }: IBadRequestPayload = {}) {
    super({
      message: message || 'Request cannot be processed due to invalid data provided',
      code: code || 'GENERIC.BAD_REQUEST',
      status: 400,
      data: {
        details,
      },
    });
  }
}
