import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';
import { TimerController } from './timer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimerLogEntity } from '@/modules/timer/entities/timer-log.entity';
import { Timer } from '@/modules/timer/entities/timer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimerLogEntity, Timer])],
  controllers: [TimerController],
  providers: [TimerService],
})
export class TimerModule {}
