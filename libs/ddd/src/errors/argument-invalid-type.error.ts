import { Constructable } from '../interfaces';
import { DomainError } from './domain.error';

export class ArgumentInvalidTypeError extends DomainError {
  constructor(argumentName: string, expectedType: string | Constructable<unknown>) {
    const constructorName = typeof expectedType === 'string' ? expectedType : expectedType.name;
    const message = `Argument ${argumentName} should be a ${constructorName}`;

    super({
      message,
      code: 'GENERIC.ARGUMENT_INVALID_TYPE',
    });
  }
}
