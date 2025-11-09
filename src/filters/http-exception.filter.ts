import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus?.() ?? 500;
    const res = exception.getResponse?.() as unknown as
      | string
      | { message?: string | string[] };

    let message: string;
    if (typeof res === 'string') {
      message = res;
    } else if (Array.isArray(res?.message)) {
      message = res.message.join('; ');
    } else if (res?.message) {
      message = res.message;
    } else {
      message = exception.message || 'Error';
    }

    response.status(status).json({
      status: status,
      message: message,
      data: null,
    });
  }
}
