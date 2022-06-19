import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('third_user')
@Index(['thirdId', 'thirdType'], { unique: true })
export class ThirdUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', comment: '绑定的用户ID' })
  userId: string;

  @Index()
  @Column({ name: 'third_id', comment: '第三方用户id' })
  thirdId: string;

  @Column({
    comment: '第三方类型',
    type: 'enum',
    name: 'third_type',
    enum: ['github', 'gitlab', 'feishu', 'wechat', 'weibo', 'qq', 'gitee'],
  })
  thirdType: string;
}
