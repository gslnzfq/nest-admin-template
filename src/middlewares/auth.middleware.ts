import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import { CacheService } from '@/modules/cache/cache.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly cacheService: CacheService) {}

  async use(req: any, res: Response, next: Function) {
    // 获取当前的token放在request上，方便后面访问
    // header上的authorization优先级高于cookie的token字段
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }

    req.token = token;

    // 查询token是否在黑名单里面
    const tokenState = await this.cacheService.get(`block:${token}`);
    if (tokenState) {
      // 标识这个token是未授权的
      req.tokenInvalid = true;
    }

    next();
  }
}
