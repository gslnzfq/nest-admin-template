import {
  ArgumentMetadata,
  Injectable,
  ValidationPipe,
  Logger,
} from '@nestjs/common';

@Injectable()
export class CommonValidatePipe extends ValidationPipe {
  constructor() {
    super({ transform: true, stopAtFirstError: true });
  }
  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (e: any) {
      Logger.warn(`参数错误：${e.response.message.toString()}`);
      if (process.env.NODE_ENV === 'production') {
        // 这里应该使用logger打印日志
        throw new Error(`参数错误，请检查`);
      } else {
        throw new Error(`${e.response.message.toString()}`);
      }
    }
  }
}
