import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersEntity } from '@/modules/users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { encryption } from '@/utils/password';
import { UserResult } from '@/modules/oauth2/service/oauth2.service.interface';
import { ThirdUserEntity } from '@/modules/users/entities/third-user.entity';
import { PartialType } from '@nestjs/swagger';
import { PrivateTokenEntity } from '@/modules/users/entities/private-token.entity';

class ThirdUserInput extends PartialType(ThirdUserEntity) {}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepo: Repository<UsersEntity>,
    @InjectRepository(ThirdUserEntity)
    private readonly thirdUserRepository: Repository<ThirdUserEntity>,
    @InjectRepository(PrivateTokenEntity)
    private readonly privateTokenRepository: Repository<PrivateTokenEntity>,
  ) {}

  async fineOneByUserId(userId: string): Promise<any> {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async findOneByAccountOrEmail(account: string): Promise<any> {
    // 通过邮箱和用户名查询用户
    return this.userRepo.findOne({
      where: [{ account: account }, { email: account }],
    });
  }

  async saveUser(user: UserResult): Promise<any> {
    const { email, name, avatar, account, channel } = user;
    // 查询当前账号是否存在，先通过email查询
    let existUser = await this.userRepo.findOne({ where: { email } });
    if (!existUser) {
      // 查询account是否存在，如果存在，就把email和account合并
      existUser = await this.userRepo.findOne({ where: { account } });
    }
    // 如果存在，填充其他的信息
    if (existUser) {
      existUser.account = existUser.account || account;
      existUser.avatar = existUser.avatar || avatar;
      existUser.name = existUser.name || name;
    } else {
      existUser = new UsersEntity();
      existUser.email = email;
      existUser.account = account;
      existUser.avatar = avatar;
      existUser.name = name;
      existUser.pass = encryption(Math.random().toString());
      existUser.channel = channel || 'local';
    }

    const result = await this.userRepo.save(existUser);

    return instanceToPlain(result, { excludePrefixes: ['pass'] });
  }

  /**
   * 通过第三方账号查找
   * @param thirdId
   * @param thirdType
   */
  async findOneByThirdId(thirdId: string, thirdType: string): Promise<any> {
    return this.thirdUserRepository.findOne({ where: { thirdId, thirdType } });
  }

  /**
   * 保存三方用户
   * @param thirdUser
   */
  async saveThirdUser(thirdUser: ThirdUserInput): Promise<any> {
    return this.thirdUserRepository.save(thirdUser);
  }

  /**
   * 删除三方绑定的ID
   * @param userId 当前用户ID
   * @param thirdType 三方平台类型
   */
  async deleteThirdUser(userId: string, thirdType: string): Promise<any> {
    const result = await this.thirdUserRepository.delete({ userId, thirdType });
    return result.affected;
  }

  /**
   * 生成用户的私有token
   * @param data
   */
  async savePrivateToken(
    data: Omit<PrivateTokenEntity, 'id' | 'createTime'>,
  ): Promise<any> {
    const token = new PrivateTokenEntity();
    token.userId = data.userId;
    token.token = data.token;
    token.expireTime = data.expireTime;
    return this.privateTokenRepository.save(token);
  }

  /**
   * 将token失效
   * @param token
   */
  async removePrivateToken(token: string): Promise<any> {
    return this.privateTokenRepository.delete({ token });
  }

  /**
   * 查询当前用户的私有token
   * @param userId
   */
  async findPrivateTokenList(userId: string): Promise<any[]> {
    return this.privateTokenRepository.find({ where: { userId } });
  }
}
