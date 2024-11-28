import { HttpException } from '@nestjs/common';

export interface IBaseErrorProps {
  message: string;
  status?: number;
  code: string;
  data?: object;
}

/** Base error class that is supported by default NestJS exception filter */
export class BaseError extends HttpException {
  private readonly code: string;
  private readonly data?: object;

  constructor({ message, status = 500, code, data }: IBaseErrorProps) {
    super(message, status);

    this.code = code;
    this.data = data;
  }

  public static getLogData(err: Error) {
    if (err instanceof BaseError) {
      return err.toLogs();
    }

    return {
      errName: err.name,
      errCode: 'UNKNOWN',
      errMessage: err.message,
    };
  }

  public getResponse(): object {
    const response = super.getResponse();

    if (typeof response === 'string') {
      return {
        message: response,
        statusCode: this.getStatus(),
        code: this.code,
        data: this.data,
      };
    }

    return {
      ...response,
      statusCode: this.getStatus(),
      code: this.code,
      data: this.data,
    };
  }

  public toLogs() {
    return {
      errName: this.name,
      errCode: this.code,
      errMessage: this.message,
    };
  }
}
