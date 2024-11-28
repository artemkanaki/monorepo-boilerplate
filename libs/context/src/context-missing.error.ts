import { BaseError } from '@lib/common';

export class ContextMissingError extends BaseError {
  constructor(details?: string) {
    super({
      code: 'CONTEXT.CONTEXT_MISSING',
      status: 500,
      message:
        'Context is missing. It probably was not initialized. Make sure to apply the @ContextService.Wrap() decorator to the method.',
      data: {
        details,
      },
    });
  }
}
