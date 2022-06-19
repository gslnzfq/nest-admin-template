import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { OssController } from './oss.controller';

import { multerConfig } from '@/modules/oss/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OssEntity } from '@/modules/oss/oss.entity';
import { OssService } from './oss.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OssEntity]),
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => multerConfig(config),
    }),
  ],
  controllers: [OssController],
  providers: [OssService],
})
export class OssModule {}
