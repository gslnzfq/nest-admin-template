import { Module } from '@nestjs/common';
import { Oauth2Controller } from './oauth2.controller';
import { GitlabService } from './service/gitlab.service';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { GithubService } from '@/modules/oauth2/service/github.service';
import { FeishuService } from '@/modules/oauth2/service/feishu.service';
import { GiteeService } from '@/modules/oauth2/service/gitee.service';

@Module({
  imports: [HttpModule, UsersModule, AuthModule],
  controllers: [Oauth2Controller],
  providers: [GitlabService, GithubService, FeishuService, GiteeService],
})
export class Oauth2Module {}
