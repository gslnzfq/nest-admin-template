import { Module } from '@nestjs/common';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@/modules/auth/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@/modules/cache/cache.module';
import { EmailModule } from '@/modules/email/email.module';
import { HttpModule } from '@nestjs/axios';
import { OssModule } from '@/modules/oss/oss.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TestModule } from '@/modules/test/test.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oauth2Module } from '@/modules/oauth2/oauth2.module';
import * as path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../upload'),
      serveRoot: '/assets',
      serveStaticOptions: {
        setHeaders: (res, path) => {
          // json文件直接下载，不添加header会走拦截器
          if (path.endsWith('.json')) {
            const filename = path.split('/').pop();
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader(
              'Content-Disposition',
              `attachment; filename=${filename}`,
            );
          }
        },
      },
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
    CacheModule,
    EmailModule,
    OssModule,
    AuthModule,
    UsersModule,
    Oauth2Module,
    TestModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
