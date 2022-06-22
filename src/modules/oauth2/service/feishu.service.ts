import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from 'rxjs';
import {
  Oauth2ServiceInterface,
  UserResult,
} from '@/modules/oauth2/service/oauth2.service.interface';

@Injectable()
export class FeishuService implements Oauth2ServiceInterface {
  clientId = '';
  clientSecret = '';
  redirectUrl = '';

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.clientId = this.config.get('FEISHU_CLIENT_ID');
    this.clientSecret = this.config.get('FEISHU_CLIENT_SECRET');
    this.redirectUrl = this.config.get('FEISHU_REDIRECT_URL');
  }

  /**
   * 获取access_token通过授权吗
   * @param code
   */
  getAccessToken(code: string) {
    return this.http
      .post(`https://open.feishu.cn/connect/qrconnect/oauth2/access_token/`, {
        app_id: this.clientId,
        app_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUrl,
        code,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * 通过refresh_token获取access_token
   * @param refreshToken
   */
  getAccessTokenByRefreshToken(refreshToken: string) {
    return this.http
      .post(`https://open.feishu.cn/connect/qrconnect/oauth2/access_token/`, {
        app_id: this.clientId,
        app_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * 获取用户信息
   * @param accessToken
   */
  getUser(accessToken: string): Observable<UserResult> {
    return this.http
      .get(`https://open.feishu.cn/open-apis/authen/v1/user_info`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .pipe(
        map((res) => {
          /**
           * {
           *   avatar_big: '',
           *   avatar_middle: '',
           *   avatar_thumb: '',
           *   avatar_url: '',
           *   en_name: '',
           *   name: '',
           *   open_id: '',
           *   tenant_key: '',
           *   union_id: '',
           *   user_id: ''
           * }
           */
          const {
            name,
            avatar_url,
            email = '',
            union_id,
            user_id,
          } = res.data.data;
          return {
            name,
            email,
            avatar: avatar_url,
            thirdId: union_id,
            account: user_id,
            channel: 'feishu',
          };
        }),
      );
  }
}
