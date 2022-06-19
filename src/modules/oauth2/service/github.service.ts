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
export class GithubService implements Oauth2ServiceInterface {
  clientId = '';
  clientSecret = '';
  redirectUrl = '';

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.clientId = this.config.get('GITHUB_CLIENT_ID');
    this.clientSecret = this.config.get('GITHUB_CLIENT_SECRET');
    this.redirectUrl = this.config.get('GITHUB_REDIRECT_URL');
  }

  /**
   * 获取access_token通过授权吗
   * @param code
   */
  getAccessToken(code: string) {
    return this.http
      .post(`https://github.com/login/oauth/access_token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUrl,
        code,
      })
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
      .get(`https://api.github.com/user`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${accessToken}`,
        },
      })
      .pipe(
        map((res) => {
          /**
           * {
           *   "login": "octocat",
           *   "id": 1,
           *   "node_id": "MDQ6VXNlcjE=",
           *   "avatar_url": "https://github.com/images/error/octocat_happy.gif",
           *   "gravatar_id": "",
           *   "url": "https://api.github.com/users/octocat",
           *   "html_url": "https://github.com/octocat",
           *   "followers_url": "https://api.github.com/users/octocat/followers",
           *   "following_url": "https://api.github.com/users/octocat/following{/other_user}",
           *   "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
           *   "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
           *   "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
           *   "organizations_url": "https://api.github.com/users/octocat/orgs",
           *   "repos_url": "https://api.github.com/users/octocat/repos",
           *   "events_url": "https://api.github.com/users/octocat/events{/privacy}",
           *   "received_events_url": "https://api.github.com/users/octocat/received_events",
           *   "type": "User",
           *   "site_admin": false,
           *   "name": "monalisa octocat",
           *   "company": "GitHub",
           *   "blog": "https://github.com/blog",
           *   "location": "San Francisco",
           *   "email": "octocat@github.com",
           *   "hireable": false,
           *   "bio": "There once was...",
           *   "twitter_username": "monatheoctocat",
           *   "public_repos": 2,
           *   "public_gists": 1,
           *   "followers": 20,
           *   "following": 0,
           *   "created_at": "2008-01-14T04:33:35Z",
           *   "updated_at": "2008-01-14T04:33:35Z",
           *   "private_gists": 81,
           *   "total_private_repos": 100,
           *   "owned_private_repos": 100,
           *   "disk_usage": 10000,
           *   "collaborators": 8,
           *   "two_factor_authentication": true,
           *   "plan": {
           *     "name": "Medium",
           *     "space": 400,
           *     "private_repos": 20,
           *     "collaborators": 0
           *   }
           * }
           */
          const { name, avatar_url, email, login, id } = res.data;
          return {
            name,
            email,
            avatar: avatar_url,
            account: login,
            channel: 'github',
            thirdId: String(id),
          };
        }),
      );
  }
}
