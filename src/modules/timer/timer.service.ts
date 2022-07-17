import { Injectable } from '@nestjs/common';
import { CreateTimerDto } from './dto/create-timer.dto';
import { Repository } from 'typeorm';
import { Timer } from '@/modules/timer/entities/timer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TimerLogEntity } from '@/modules/timer/entities/timer-log.entity';

@Injectable()
export class TimerService {
  constructor(
    @InjectRepository(Timer)
    private readonly timerRepo: Repository<Timer>,
    @InjectRepository(TimerLogEntity)
    private readonly timerLogRepo: Repository<TimerLogEntity>,
  ) {}

  async create(createTimerDto: CreateTimerDto) {
    return await this.timerRepo.save(createTimerDto);
  }

  async createRunLog(timerLog: Partial<TimerLogEntity>) {
    return await this.timerLogRepo.save(timerLog);
  }

  async findAll() {
    return await this.timerRepo.find({ where: [{ status: 1 }, { status: 2 }] });
  }

  async findOne(id: number) {
    return await this.timerRepo.findOne({ where: { id } });
  }

  async remove(id: number) {
    // 就修改下状态，保留执行日志
    return await this.timerRepo.update({ id }, { status: 3 });
  }
}
