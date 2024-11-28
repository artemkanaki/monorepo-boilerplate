import { BaseError } from './base.error';

export interface IConflictPayload {
  message?: string;
  details?: string;
  code?: string;
}

export class ConflictError extends BaseError {
  constructor({ message, details, code }: IConflictPayload = {}) {
    super({
      message: message || 'Request cannot be processed due to data conflict',
      code: code || 'GENERIC.CONFLICT',
      status: 409,
      data: {
        details,
      },
    });
  }
}
