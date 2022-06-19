import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 在Header上获取Bearer Token
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // 在cookie中获取token的字段
        (req) => req.cookies.token,
      ]),
      // 不忽略过期时间，一旦过期就是未授权
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, account: payload.account };
  }
}
