import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      // POST 请求的用户名参数，默认是username
      usernameField: 'account',
      // POST 请求的密码参数，默认是password
      passwordField: 'pass',
    });
  }

  /**
   * 实现validate方法，使用用户名和密码验证，返回用户信息
   * 本地策略的参数就是用户名和密码
   * @param username
   * @param password
   */
  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new Error('账号或密码不正确');
    }
    return user;
  }
}
