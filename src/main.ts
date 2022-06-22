import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
// import * as csurf from 'csurf';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { green, magenta } from 'chalk';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CommonExceptionFilter } from './filters/common-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { CommonValidatePipe } from './pipes/common-validate.pipe';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  // cookieParser是csurf的依赖，需要引入
  app.use(cookieParser());
  // app.use(csurf({ cookie: true }));
  // 添加常见的header，防止被攻击
  app.use(helmet());
  // 设置访问频率
  app.set('trust proxy', 1);
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 10分钟
      max: 1000, // 限制10分钟内最多只能访问1000次，每分钟100次
      message: JSON.stringify({
        code: 502,
        message: '请求过于频繁，请稍后再试',
      }),
      // 自定义跳过限制的请求，可以是域名，IP，路径，方法，header等
      // skip: (req, res) => {
      //   return false;
      // },
    }),
  );

  // 处理异常
  app.useGlobalFilters(new CommonExceptionFilter());
  // 转换响应的数据
  app.useGlobalInterceptors(new TransformInterceptor());
  // 添加参数校验管道
  app.useGlobalPipes(new CommonValidatePipe());

  const config = app.get(ConfigService);

  const listenPort = parseInt(config.get('LISTEN_PORT'), 10) || 3000;
  const swaggerBase = config.get('SWAGGER_URL') || 'api';
  const disableSwagger = config.get('SWAGGER_OFF') === 'true';

  // 启动swagger服务
  if (!disableSwagger) {
    // 添加swagger生成API
    const config = new DocumentBuilder()
      .setTitle('Nest Admin Template')
      .setDescription('一个基于nest开发的后台管理系统模版')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerBase, app, document);
  }

  // 必须要设置了swagger之后再listen，否则swagger将无法访问
  await app.listen(listenPort);
  Logger.debug(green(`Server running on http://localhost:${listenPort}`));

  if (!disableSwagger) {
    Logger.debug(
      magenta(
        `Swagger Server running on http://localhost:${listenPort}/${swaggerBase}`,
      ),
    );
  }
}

bootstrap();
