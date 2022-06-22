import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IGNORE_AUTH_CHECK_KEY } from '@/decorators/ignore-auth-check';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    /**
     * 是否忽略jwt检查
     * 给某些路由设置白名单等
     * 在class和method上都查找
     */
    const ignoreJwtAuth = this.reflector.getAllAndOverride<boolean>(
      IGNORE_AUTH_CHECK_KEY,
      [context.getClass(), context.getHandler()],
    );

    if (ignoreJwtAuth) {
      return true;
    }

    // token在黑名单里面
    if (request.tokenInvalid) {
      throw new UnauthorizedException();
    }

    // 在这里添加自定义的认证逻辑
    // 例如调用 super.logIn(request) 来建立一个session
    return super.canActivate(context);
  }

  handleRequest(error, user) {
    // 可以抛出一个基于info或者err参数的异常
    if (error || !user) {
      throw error || new UnauthorizedException();
    }
    return user;
  }
}
