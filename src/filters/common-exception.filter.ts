import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 服务器出现错的时候
 */
@Catch()
export class CommonExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // HTTP 异常 需转发状态码
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse() as any;
      response.status(status).json({
        status: status,
        message: responseBody.message || exception.message,
      });
    } else {
      // Error，Promise.reject等
      response.status(200).json({
        status: 1,
        message: exception.message || exception,
      });
    }
  }
}
