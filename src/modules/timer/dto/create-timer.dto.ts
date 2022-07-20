import { Timer } from '@/modules/timer/entities/timer.entity';
import { OmitType } from '@nestjs/swagger';

export class CreateTimerDto extends OmitType(Timer, [
  'id',
  'status',
  'userId',
  'created',
]) {}
