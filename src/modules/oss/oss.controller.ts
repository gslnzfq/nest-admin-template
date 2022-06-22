import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
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

  @ApiBearerAuth()
  @ApiOperation({ summary: '根据文件id下载文件' })
  @ApiParam({ name: 'id', type: 'string', required: true })
  @Get('download/:id')
  async downloadFileById(@Req() req, @Res() res, @Param('id') id: string) {
    const file = await this.ossService.findById(id);
    if (!file) {
      return res.status(404).send('文件不存在');
    }
    const saveDir = path.resolve(this.config.get('UPLOAD_PATH'));
    const filePath = path.join(saveDir, file.url);
    res.download(filePath, file.name);
  }
}
