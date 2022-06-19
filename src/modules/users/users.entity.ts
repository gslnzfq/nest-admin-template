import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('user')
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid', { comment: '自动生成ID' })
  public id: string;

  @Column({ comment: '用户名（展示，中文）', nullable: true })
  public name: string;

  @Index({ unique: true })
  @Column({ comment: '登录名' })
  public account: string;

  @Exclude({ toPlainOnly: true }) // 输出屏蔽密码
  @Column({ comment: '密码' })
  public pass: string;

  @Column({ comment: '头像', nullable: true })
  public avatar: string;

  @Index({ unique: true })
  @Column({ comment: '邮箱', nullable: true })
  public email: string;

  @Column({ comment: '注册渠道', nullable: true })
  public channel: string;

  @CreateDateColumn({
    name: 'register_time',
    type: 'timestamp',
    comment: '注册时间',
  })
  public registerTime: Date;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'timestamp',
    comment: '更新时间',
  })
  public updateTime: Date;
}
