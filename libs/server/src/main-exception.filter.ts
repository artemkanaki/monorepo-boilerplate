import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  BadGatewayError,
  BadRequestError,
  BaseError,
  ConflictError,
  ForbiddenError,
  ILoggerPort,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '@lib/common';
import { ContextService } from '@lib/context';

interface IArgumentsHostWithContext extends ArgumentsHost {
  contextType: string;
}

// catches all errors
@Catch(Error)
export class MainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: ILoggerPort) {}

  catch(errRaw: BaseError | Error, host: IArgumentsHostWithContext) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const err = this.processError(errRaw);
    const status = this.processHttpStatus(err);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // prevents sending the errors like BadRequest from validator to Sentry
      this.logger.critical('Unexpected error occurred', errRaw);
    }

    const responseBody = {
      ...err.getResponse(),
      context: ContextService.getRaw(),
    };

    this.logger.log('Error response', responseBody);

    if (response.headersSent) {
      this.logger.error('Headers already have been sent, error wont be sent', new Error(), {
        errMessage: errRaw.message,
        err: errRaw,
      });

      return;
    }

    response.status(status).json(responseBody);
  }

  private processError(err: Error): BaseError {
    if (err instanceof BaseError) {
      return err;
    } else if (err instanceof HttpException) {
      switch (err.getStatus()) {
        case HttpStatus.BAD_REQUEST:
          const response: any = err.getResponse();
          let details: string;
          if (typeof response === 'object') {
            details = Array.isArray(response?.message) ? response.message.join('; ') : response.message;
          } else {
            details = response.toString();
          }

          return new BadRequestError({
            message: err.message,
            details,
          });
        case HttpStatus.UNAUTHORIZED:
          return new UnauthorizedError();
        case HttpStatus.FORBIDDEN:
          return new ForbiddenError();
        case HttpStatus.NOT_FOUND:
          return new NotFoundError();
        case HttpStatus.CONFLICT:
          return new ConflictError();
        case HttpStatus.BAD_GATEWAY:
          return new BadGatewayError();
        default:
          return new InternalServerError();
      }
    }

    return new InternalServerError();
  }

  private processHttpStatus(err: BaseError): HttpStatus {
    let status: HttpStatus | undefined;
    if (err instanceof BadRequestError) {
      // 400
      status = HttpStatus.BAD_REQUEST;
    } else if (err instanceof UnauthorizedError) {
      // 401
      status = HttpStatus.UNAUTHORIZED;
    } else if (err instanceof ForbiddenError) {
      // 403
      status = HttpStatus.FORBIDDEN;
    } else if (err instanceof NotFoundError) {
      // 404
      status = HttpStatus.NOT_FOUND;
    } else if (err instanceof ConflictError) {
      // 409
      status = HttpStatus.CONFLICT;
    } else if (err instanceof BadGatewayError) {
      // 503
      status = HttpStatus.BAD_GATEWAY;
    } else if (err instanceof InternalServerError) {
      // 500
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return status;
  }
}
