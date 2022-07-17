import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('timer')
export class Timer {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ comment: '定时任务名称', unique: true })
  public name: string;

  @Column({ name: 'display_name', comment: '展示名称' })
  public displayName: string;

  @Column({ comment: '定时任务触发时间值' })
  public value: string;

  @Column({ comment: '定时任务动作' })
  public action: string;

  @Column({ comment: '定时任务参数JSON字符串' })
  public params: string;

  @Column({ comment: '是否记录日志', default: false })
  public logger: boolean;

  @Column({
    type: 'tinyint',
    comment: '当前状态，1 运行中 2 未运行 3 已删除',
    default: 1,
  })
  public status: 1 | 2 | 3;

  @Column({ name: 'user_id', comment: '创建者id' })
  public userId: string;

  @CreateDateColumn({ comment: '创建时间' })
  public created: Date;
}
