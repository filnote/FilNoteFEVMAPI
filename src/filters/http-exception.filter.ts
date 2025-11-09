import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus?.() ?? 500;
        const res = exception.getResponse?.() as any;

        let message: string =
            (typeof res === 'string' && res) ||
            (Array.isArray(res?.message) ? res.message.join('; ') : res?.message) ||
            exception.message ||
            'Error';

        response.status(status).json({
            status: status,
            message: message,
            data: null,
        });
    }
}