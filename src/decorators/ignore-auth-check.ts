import { SetMetadata } from '@nestjs/common';

/**
 * 忽略在jwt策略中进行校验
 * 可以修饰controller和某一个action
 */
export const IGNORE_AUTH_CHECK_KEY = 'IGNORE_AUTH_CHECK';

/**
 * 忽略jwt授权，直接访问
 * @constructor
 */
export const IgnoreAuthCheck = () => SetMetadata(IGNORE_AUTH_CHECK_KEY, true);
