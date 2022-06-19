import { compareSync, hashSync, genSaltSync } from 'bcryptjs';

/**
 * 加密密码 加密完成后存储起来，下次就可以做对比了
 * @param password
 */
export const encryption = (password: string) => {
  const salt = genSaltSync();
  return hashSync(password, salt);
};

/**
 * 比较密码
 * @param password 用户输入的密码
 * @param hash password 加密后的密码，一般是用户注册的时候持久化存储的
 */
export const compare = (password: string, hash: string) => {
  return compareSync(password, hash);
};
