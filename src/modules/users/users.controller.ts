import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { AuthService } from '@/modules/auth/auth.service';
import { UsersService } from './users.service';
import { CreatePrivateTokenDto } from './dto/create-private-token.dto';
import { CacheService } from '@/modules/cache/cache.service';
import { RemovePrivateTokenDto } from '@/modules/users/dto/remove-private-token.dto';
import * as dayjs from 'dayjs';
import * as ms from 'ms';

@ApiTags('用户模块')
@Controller('user')
export class UsersController {
  constructor(
    private readonly service: UsersService,
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 将token设置为过期
   * @param token
   */
  async setTokenExpire(token: string) {
    // 获取当前token的过期时间
    const { exp } = (await this.authService.decodeToken(token)) as any;
    // 保存到token过期后删除token
    await this.cacheService.setUseExpire(`block:${token}`, true, exp);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '获取登录用户的信息' })
  @Get('info')
  async getUserInfo(@Req() req) {
    const userInfo = await this.service.fineOneByUserId(req.user.id);
    return instanceToPlain(userInfo);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '注销当前用户' })
  @Get('logout')
  @HttpCode(HttpStatus.UNAUTHORIZED)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    await this.setTokenExpire(req.token);
    return true;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '删除用户的私有token' })
  @Post('private-token/expire')
  async removePrivateToken(@Req() req, @Body() body: RemovePrivateTokenDto) {
    await this.service.removePrivateToken(body.token);
    await this.setTokenExpire(body.token);
    return true;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '生成用户的私有token' })
  @Post('private-token')
  async signPrivateToken(@Req() req, @Body() body: CreatePrivateTokenDto) {
    const date = dayjs(body.expiresIn);
    const now = dayjs();
    if (date.isBefore(now)) {
      throw new Error('失效时间不能小于当前时间');
    }
    const diff = date.diff(now, 'milliseconds');
    // 转换成过期时间
    const msString = ms(diff, { long: true });
    const token = await this.authService.signPrivateToken(
      {
        account: req.user.account,
        id: req.user.userId,
      },
      msString,
    );

    await this.service.savePrivateToken({
      token,
      userId: req.user.userId,
      expireTime: date.toDate(),
    });

    return { token };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户的私有token列表' })
  @Get('private-token')
  async getPrivateToken(@Req() req) {
    const res = await this.service.findPrivateTokenList(req.user.userId);
    return res.map((item) =>
      instanceToPlain(item, { excludePrefixes: ['userId'] }),
    );
  }
}
