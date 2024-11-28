import { DomainError } from './domain.error';

export class ArgumentMissingError extends DomainError {
  constructor(details?: string) {
    super({
      message: 'Argument missing',
      code: 'GENERIC.ARGUMENT_MISSING',
      data: {
        details,
      },
    });
  }
}
