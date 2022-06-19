import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '@/modules/auth/auth.service';
import { CacheService } from '@/modules/cache/cache.service';
import { EmailService } from '@/modules/email/email.service';
import { HttpService } from '@nestjs/axios';
import { ApiSuccessResponse } from '@/decorators/success-response';
import { map } from 'rxjs';
import { join } from 'path';
import { createReadStream } from 'fs';
import { IsInt, IsString, Max, Min } from 'class-validator';
import { IgnoreAuthCheck } from '@/decorators/ignore-auth-check';

export class TestDto {
  @ApiProperty({ description: '猫的名字', example: '大花猫' })
  @IsString({ message: 'name必须是字符串' })
  name: string;

  @ApiProperty({
    description: '猫的年龄, 必须是整数,1-100之间',
    example: 3,
    minimum: 1,
    maximum: 100,
  })
  @IsInt({ message: 'age必须是数字' })
  @Min(1, { message: 'age必须是1-100之间' })
  @Max(100, { message: 'age必须是1-100之间' })
  age: number;

  @ApiProperty({ description: '猫的性别', enum: ['男', '女'], example: '男' })
  @IsString({ message: 'breed必须是字符串' })
  breed: string;
}

@ApiTags('其他测试')
@Controller()
export class TestController {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
    private readonly httpService: HttpService,
  ) {}

  @IgnoreAuthCheck()
  @ApiOperation({ summary: '测试请求参数' })
  @ApiSuccessResponse({ model: TestDto, isPager: true })
  @Post()
  getHello(@Body() query: TestDto) {
    return query;
  }

  @IgnoreAuthCheck()
  @ApiOperation({ summary: '测试获取cache' })
  @Get('cache')
  async getCache() {
    const cache = await this.cacheService.get('user-cache');
    return { cache };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '测试发送邮件' })
  @Get('email')
  async sendEmail() {
    return await this.emailService.send(
      'zhangfqmail@126.com',
      '测试邮件',
      '<h1>测试邮件标题</h1>',
    );
  }

  @IgnoreAuthCheck()
  @ApiOperation({ summary: '测试调用其他网站的接口' })
  @ApiQuery({
    name: 'url',
    description: '请求地址',
    example: 'https://api.bootcdn.cn/libraries.min.json',
  })
  @Get('http')
  async getHttp(
    @Query('url') url = 'https://api.bootcdn.cn/libraries.min.json',
  ) {
    return this.httpService.get(url).pipe(map((res) => res.data));
  }

  /**
   * 直接下载已经存在的文件
   * @param res
   */
  @Get('download')
  @IgnoreAuthCheck()
  @ApiOperation({ summary: '测试文件下载' })
  download(@Res() res) {
    res.set({
      'Content-Disposition': 'attachment; filename="1.png"',
    });
    return res.sendFile(
      join(process.cwd(), 'upload/other/202206/12002204-111111.png'),
    );
  }

  /**
   * 通过stream下载文件
   * 下载文件不能走转换器，否则会下载失败
   * @param res
   */
  @Get('stream')
  @IgnoreAuthCheck()
  @ApiOperation({ summary: '测试文件流下载' })
  stream(@Res() res) {
    const stream = createReadStream(
      join(process.cwd(), 'upload/other/202206/12002204-111111.png'),
    );
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="2.png"',
    });
    stream.pipe(res);
  }
}
