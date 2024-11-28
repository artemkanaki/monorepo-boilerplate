import { BaseError } from './base.error';

export interface IBadGatewayPayload {
  message?: string;
  details?: string;
  code?: string;
}

export class BadGatewayError extends BaseError {
  constructor({ code, details, message }: IBadGatewayPayload = {}) {
    super({
      message: message || 'Another server returned unexpected response',
      code: code || 'GENERIC.BAD_GATEWAY',
      status: 503,
      data: {
        details,
      },
    });
  }
}
