import { BaseError } from '@lib/common';

export class TransactionOverrideError extends BaseError {
  constructor(details?: string) {
    super({
      code: 'CONTEXT.TRANSACTION_OVERRIDE',
      status: 500,
      message:
        'Attempt to override existing transaction detected. Finish the current transaction before starting a new one.',
      data: {
        details,
      },
    });
  }
}
