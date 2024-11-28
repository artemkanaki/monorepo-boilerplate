import { BaseError } from './base.error';

export interface INotFoundPayload {
  message?: string;
  details?: string;
  code?: string;
}

export class NotFoundError extends BaseError {
  constructor({ message, details, code }: INotFoundPayload = {}) {
    super({
      message: message || 'Resource was not found',
      code: code || 'GENERIC.NOT_FOUND',
      status: 404,
      data: {
        details,
      },
    });
  }
}
