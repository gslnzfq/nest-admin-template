import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@/modules/auth/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@/modules/cache/cache.module';
import { EmailModule } from '@/modules/email/email.module';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { OssModule } from '@/modules/oss/oss.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TestModule } from '@/modules/test/test.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oauth2Module } from '@/modules/oauth2/oauth2.module';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { PlatformModule } from '@/modules/platform/platform.module';
import { TimerModule } from '@/modules/timer/timer.module';
import * as path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../upload'),
      serveRoot: '/assets',
    }),
    HttpModule.register({
      timeout: 5000, // 超时时间
      maxRedirects: 5, // 最大重定向次数
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.local`,
        `.env.${process.env.NODE_ENV || 'production'}`,
        '.env',
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get('DB_HOST'),
          port: parseInt(config.get('DB_PORT'), 10),
          username: config.get('DB_USER'),
          password: config.get('DB_PASS'),
          database: config.get('DB_NAME'),
          entities: [`${__dirname}/**/*.entity{.ts,.js}`],
          synchronize: true,
        };
      },
    }),
    ScheduleModule.forRoot(),
    CacheModule,
    EmailModule,
    OssModule,
    AuthModule,
    UsersModule,
    Oauth2Module,
    PlatformModule,
    TimerModule,
    TestModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
