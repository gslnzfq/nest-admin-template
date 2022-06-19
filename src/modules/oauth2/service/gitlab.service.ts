import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from 'rxjs';
import {
  Oauth2ServiceInterface,
  UserResult,
} from '@/modules/oauth2/service/oauth2.service.interface';

@Injectable()
export class GitlabService implements Oauth2ServiceInterface {
  baseUrl = '';
  clientId = '';
  clientSecret = '';
  redirectUrl = '';

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = this.config.get('GITLAB_URL');
    this.clientId = this.config.get('GITLAB_CLIENT_ID');
    this.clientSecret = this.config.get('GITLAB_CLIENT_SECRET');
    this.redirectUrl = this.config.get('GITLAB_REDIRECT_URL');
  }

  /**
   * 获取access_token通过授权吗
   * @param code
   */
  getAccessToken(code: string) {
    return this.http
      .post(
        `${this.baseUrl}/oauth/token`,
        {},
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUrl,
            code,
          },
        },
      )
      .pipe(map((res) => res.data));
  }

  /**
   * 获取用户信息
   * @param accessToken
   */
  getUser(accessToken: string): Observable<UserResult> {
    return this.http
      .get(`${this.baseUrl}/api/v3/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .pipe(
        map((res) => {
          /**
           * {
           *   name: '',
           *   username: '',
           *   id: 1,
           *   state: '',
           *   avatar_url: '',
           *   web_url: '',
           *   created_at: '',
           *   is_admin: false,
           *   bio: '',
           *   location: '',
           *   skype: '',
           *   linkedin: '',
           *   twitter: '',
           *   website_url: '',
           *   last_sign_in_at: '',
           *   confirmed_at: '',
           *   email: '',
           *   theme_id: 2,
           *   color_scheme_id: 1,
           *   projects_limit: 50,
           *   current_sign_in_at: '',
           *   identities: [],
           *   can_create_group: true,
           *   can_create_project: true,
           *   two_factor_enabled: false,
           *   external: false,
           *   private_token: ''
           * }
           */
          const { name, avatar_url, email, username, id } = res.data;
          return {
            name,
            avatar: avatar_url,
            email,
            account: username,
            channel: 'gitlab',
            thirdId: String(id),
          };
        }),
      );
  }
}
