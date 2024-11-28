import { DomainError } from './domain.error';

export class ArgumentInvalidError extends DomainError {
  constructor(details?: string) {
    super({
      message: 'Argument is invalid',
      code: 'GENERIC.ARGUMENT_INVALID',
      data: {
        details,
      },
    });
  }
}
