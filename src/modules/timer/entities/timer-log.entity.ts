import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('timer_log')
export class TimerLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  public id: number;

  @Column({ name: 'timer_id', comment: '定时任务ID' })
  public timerId: number;

  @Column({ comment: '参数JSON字符串' })
  public params: string;

  @Column({ comment: '运行结果' })
  public result: boolean;

  @CreateDateColumn({ comment: '运行时间' })
  public created: Date;
}
