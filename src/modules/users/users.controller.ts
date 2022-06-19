import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';

@ApiTags('用户模块')
@Controller('user')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '获取登录用户的信息' })
  @Get('info')
  async getUserInfo(@Req() req) {
    const userInfo = await this.service.fineOneByUserId(req.user.id);
    return instanceToPlain(userInfo);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前登录用户的token' })
  @Get('token')
  async getUserToken(@Req() req) {
    const {
      cookies,
      headers: { authorization },
    } = req;
    return {
      token: cookies.token || authorization?.replace('Bearer ', ''),
      description: '可以在swagger上调试使用，正常情况会从cookie中获取',
    };
  }
}
