import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { IgnoreAuthCheck } from '@/decorators/ignore-auth-check';
import { GitlabService } from '@/modules/oauth2/service/gitlab.service';
import {
  ApiBearerAuth,
  ApiMovedPermanentlyResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '@/modules/users/users.service';
import { AuthService } from '@/modules/auth/auth.service';
import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { GithubService } from '@/modules/oauth2/service/github.service';
import { Oauth2ServiceInterface } from '@/modules/oauth2/service/oauth2.service.interface';
import { FeishuService } from '@/modules/oauth2/service/feishu.service';
import { ConfigService } from '@nestjs/config';
import { GiteeService } from '@/modules/oauth2/service/gitee.service';
import { stringify } from 'qs';
import * as ms from 'ms';

@ApiTags('第三方授权')
@Controller('oauth2')
export class Oauth2Controller {
  // 支持的授权类型的集合
  serviceMap: Record<string, Oauth2ServiceInterface> = {};

  constructor(
    private readonly gitlabService: GitlabService,
    private readonly githubService: GithubService,
    private readonly feishuService: FeishuService,
    private readonly giteeService: GiteeService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.serviceMap = {
      github: this.githubService,
      gitlab: this.gitlabService,
      feishu: this.feishuService,
      gitee: this.giteeService,
    };
  }

  @IgnoreAuthCheck()
  @ApiOperation({ summary: '登录成功的回调地址' })
  @ApiQuery({ name: 'code', description: '授权码' })
  @ApiParam({
    name: 'type',
    enum: ['github', 'gitlab', 'feishu', 'gitee'],
    description: '授权类型',
  })
  @Get(':type/redirect')
  async redirect(
    @Res() res: Response,
    @Param('type') type: string,
    @Query('code') code: string,
  ): Promise<any> {
    // 获取三方的access_token
    const accessInfo = await lastValueFrom(
      this.serviceMap[type].getAccessToken(code),
    );
    // 获取三方的用户信息
    const thirdUser = await lastValueFrom(
      this.serviceMap[type].getUser(accessInfo.access_token),
    );

    // 当前系统中的用户信息
    let user: any;
    // 先判断是否绑定了账号;绑定了就直接查询用户
    const bindUser = await this.usersService.findOneByThirdId(
      thirdUser.thirdId,
      thirdUser.channel,
    );

    if (bindUser) {
      user = await this.usersService.fineOneByUserId(bindUser.userId);
    } else {
      // 如果没有绑定账号，则创建一个新的账号
      user = await this.usersService.saveUser(thirdUser);
      // 保存绑定关系
      await this.usersService.saveThirdUser({
        userId: user.id,
        thirdId: thirdUser.thirdId,
        thirdType: thirdUser.channel,
      });
    }

    // 获取当前系统用户的token
    const localToken = await this.authService.login({
      account: user.account,
      id: user.id,
    });
    // 设置浏览器cookie
    res.cookie('token', localToken.token, {
      // 客户端不可读取
      httpOnly: true,
      // 设置过期时间和token过期时间一致
      maxAge: ms(this.configService.get('JWT_EXPIRATION_TIME')),
    });
    // 返回登录结果
    // TODO 实际的场景就是重定向到登录之前的页面，这里跳转到前端的指定的登录回调页面，然后统一处理
    return res.redirect(this.configService.get('FRONT_URL'));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '绑定用户回调' })
  @ApiQuery({ name: 'code', description: '授权码' })
  @ApiParam({
    name: 'type',
    enum: ['github', 'gitlab', 'feishu', 'gitee'],
    description: '授权类型',
  })
  @Get(':type/bind')
  async bind(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Param('type') type: string,
    @Query('code') code: string,
  ): Promise<any> {
    const { userId } = req.user as any;
    // 获取三方的access_token
    const accessInfo = await lastValueFrom(
      this.serviceMap[type].getAccessToken(code),
    );
    // 获取三方的用户信息
    const thirdUser = await lastValueFrom(
      this.serviceMap[type].getUser(accessInfo.access_token),
    );

    // 查询是否其他人已经绑定
    const bindUser = await this.usersService.findOneByThirdId(
      thirdUser.thirdId,
      thirdUser.channel,
    );

    if (bindUser) {
      if (bindUser.userId === userId) {
        throw new Error('已经和当前账号绑定了');
      } else {
        throw new Error('已经被其他账号绑定了，请去其他账号解绑后再绑定');
      }
    }

    await this.usersService.saveThirdUser({
      userId: userId,
      thirdId: thirdUser.thirdId,
      thirdType: thirdUser.channel,
    });

    return { success: true };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '解绑用户' })
  @ApiParam({
    name: 'type',
    enum: ['github', 'gitlab', 'feishu', 'gitee'],
    description: '授权类型',
  })
  @Get(':type/unbind')
  async unbind(@Req() req: Request, @Param('type') type: string): Promise<any> {
    const { userId } = req.user as any;
    const result = await this.usersService.deleteThirdUser(userId, type);
    if (result > 0) {
      return { success: true };
    }
    throw new Error('解绑失败，请刷新页面再试');
  }

  @IgnoreAuthCheck()
  @ApiOperation({ summary: '重定向到gitlab登录' })
  @ApiMovedPermanentlyResponse()
  @Get('gitlab')
  async gitlab(@Res() res: Response) {
    const GITLAB_URL = this.configService.get('GITLAB_URL');
    const GITLAB_CLIENT_ID = this.configService.get('GITLAB_CLIENT_ID');
    const GITLAB_REDIRECT_URL = this.configService.get('GITLAB_REDIRECT_URL');

    const params = {
      client_id: GITLAB_CLIENT_ID,
      redirect_uri: GITLAB_REDIRECT_URL,
      response_type: 'code',
    };

    return res.redirect(`${GITLAB_URL}/oauth/authorize?${stringify(params)}`);
  }

  @IgnoreAuthCheck()
  @ApiOperation({ summary: '重定向到github登录' })
  @ApiMovedPermanentlyResponse()
  @Get('github')
  async github(@Res() res: Response) {
    const GITHUB_CLIENT_ID = this.configService.get('GITHUB_CLIENT_ID');
    const GITHUB_REDIRECT_URL = this.configService.get('GITHUB_REDIRECT_URL');

    const params = {
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URL,
      response_type: 'code',
    };

    return res.redirect(
      `https://github.com/login/oauth/authorize?${stringify(params)}`,
    );
  }

  @IgnoreAuthCheck()
  @ApiOperation({ summary: '重定向到gitee登录' })
  @ApiMovedPermanentlyResponse()
  @Get('gitee')
  async gitee(@Res() res: Response) {
    const GITEE_CLIENT_ID = this.configService.get('GITEE_CLIENT_ID');
    const GITEE_REDIRECT_URL = this.configService.get('GITEE_REDIRECT_URL');

    const params = {
      client_id: GITEE_CLIENT_ID,
      redirect_uri: GITEE_REDIRECT_URL,
      response_type: 'code',
    };

    return res.redirect(
      `https://gitee.com/oauth/authorize?${stringify(params)}`,
    );
  }

  @IgnoreAuthCheck()
  @ApiOperation({ summary: '重定向到feishu登录' })
  @ApiMovedPermanentlyResponse()
  @Get('feishu')
  async feishu(@Res() res: Response) {
    const FEISHU_CLIENT_ID = this.configService.get('FEISHU_CLIENT_ID');
    const FEISHU_REDIRECT_URL = this.configService.get('FEISHU_REDIRECT_URL');

    const params = {
      app_id: FEISHU_CLIENT_ID,
      redirect_uri: FEISHU_REDIRECT_URL,
    };

    return res.redirect(
      `https://open.feishu.cn/connect/qrconnect/page/sso/?${stringify(params)}`,
    );
  }
}
