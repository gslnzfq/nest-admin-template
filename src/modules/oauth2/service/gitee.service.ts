import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from 'rxjs';
import {
  Oauth2ServiceInterface,
  UserResult,
} from '@/modules/oauth2/service/oauth2.service.interface';
import { parse } from 'qs';

@Injectable()
export class GiteeService implements Oauth2ServiceInterface {
  clientId = '';
  clientSecret = '';
  redirectUrl = '';

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.clientId = this.config.get('GITEE_CLIENT_ID');
    this.clientSecret = this.config.get('GITEE_CLIENT_SECRET');
    this.redirectUrl = this.config.get('GITEE_REDIRECT_URL');
  }

  /**
   * 获取access_token通过授权吗
   * @param code
   */
  getAccessToken(code: string) {
    return this.http
      .post(
        `https://gitee.com/oauth/token`,
        {},
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUrl,
            grant_type: 'authorization_code',
            code,
          },
        },
      )
      .pipe(
        map((res) => {
          return parse(res.data) as any;
        }),
      );
  }

  /**
   * 获取用户信息
   * @param accessToken
   */
  getUser(accessToken: string): Observable<UserResult> {
    return this.http
      .get(`https://gitee.com/api/v5/user`, {
        params: {
          access_token: accessToken,
        },
      })
      .pipe(
        map((res) => {
          /**
           * {
           *     id: 1,
           *     login: '',
           *     name: '',
           *     avatar_url: '',
           *     url: '',
           *     html_url: '',
           *     remark: '',
           *     followers_url: '',
           *     following_url: '',
           *     gists_url: '',
           *     starred_url: '',
           *     subscriptions_url: '',
           *     organizations_url: '',
           *     repos_url: '',
           *     events_url: '',
           *     received_events_url: '',
           *     type: 'User',
           *     blog: null,
           *     weibo: null,
           *     bio: '',
           *     public_repos: 19,
           *     public_gists: 0,
           *     followers: 0,
           *     following: 5,
           *     stared: 1,
           *     watched: 145,
           *     created_at: '2016-03-18T09:01:01+08:00',
           *     updated_at: '2022-06-17T13:55:00+08:00',
           *     email: null
           *   }
           */
          const { name, avatar_url, email, login, id } = res.data;
          return {
            name,
            email,
            avatar: avatar_url,
            account: login,
            channel: 'gitee',
            thirdId: String(id),
          };
        }),
      );
  }
}
