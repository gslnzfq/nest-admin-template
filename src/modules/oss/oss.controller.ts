import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { OssService } from '@/modules/oss/oss.service';
import * as path from 'path';

@ApiTags('OSS模块')
@Controller('oss')
export class OssController {
  constructor(
    private readonly config: ConfigService,
    private readonly ossService: OssService,
  ) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传文件' })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    // {
    //   fieldname: 'file',
    //   originalname: 'package.json',
    //   encoding: '7bit',
    //   mimetype: 'application/json',
    //   destination: '/Users/xxx/xxx/nest-admin-templete/upload/other/202206',
    //   filename: '14150634-n8HHFebdM.json',
    //   path: '/Users/xxx/xxx/nest-admin-templete/upload/other/202206/14150634-n8HHFebdM.json',
    //   size: 817
    // }
    // 上传完成的后续操作
    const saveDir = path.resolve(this.config.get('UPLOAD_PATH'));
    const url = path.relative(saveDir, file.path);

    // 保存到数据库
    const resp = await this.ossService.save({
      name: file.originalname,
      url: url,
      type: file.mimetype,
      size: file.size,
      owner: req.user.userId,
    });

    return { id: resp.id, url: resp.url };
  }
}
