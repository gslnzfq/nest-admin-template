import { Observable } from 'rxjs';

/**
 * AccessToken类型
 */
interface AccessTokenResult {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * 用户信息必须包含的字段
 */
export interface UserResult {
  /**
   * 用户姓名
   */
  name: string;
  /**
   * 用户头像
   */
  avatar: string;
  /**
   * 用户邮箱
   */
  email: string;
  /**
   * 用户登录名称
   */
  account: string;
  /**
   * 注册渠道
   */
  channel: string;
  /**
   * 三方渠道ID
   */
  thirdId: string;
}

/**
 * 必须实现这个接口的所有方法才可以授权
 */
export interface Oauth2ServiceInterface {
  /**
   * 获取access_token通过授权吗
   * @param code
   */
  getAccessToken(code: string): Observable<AccessTokenResult>;

  /**
   * 获取用户信息
   * @param accessToken
   */
  getUser(accessToken: string): Observable<UserResult>;
}
