import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

// 用户私有token，可以在一段时间内访问系统
@Entity('private_token')
@Index(['userId', 'token'], { unique: true })
export class PrivateTokenEntity {
  @PrimaryColumn({ name: 'user_id', comment: '用户ID' })
  public userId: string;

  @PrimaryColumn({ comment: '私有token' })
  public token: string;

  @Column({ name: 'expire_time', type: 'timestamp', comment: '过期时间' })
  public expireTime: Date;

  @CreateDateColumn({ name: 'create_time', comment: '添加时间' })
  public createTime: Date;
}
