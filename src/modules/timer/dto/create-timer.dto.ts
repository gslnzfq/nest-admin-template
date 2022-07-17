import { PartialType } from '@nestjs/mapped-types';
import { Timer } from '@/modules/timer/entities/timer.entity';

export class CreateTimerDto extends PartialType(Timer) {}
