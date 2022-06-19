import { Injectable } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from '@/utils/password';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(account: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByAccountOrEmail(account);
    if (user && compare(pass, user.pass)) {
      // 删除密码字段返回
      return instanceToPlain(user);
    }
    return null;
  }

  /**
   * 校验完成下一步进行登录生成token
   * @param user
   */
  async login(user: any) {
    const payload = { account: user.account, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
