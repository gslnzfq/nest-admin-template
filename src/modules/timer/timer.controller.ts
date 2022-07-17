import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TimerService } from './timer.service';
import { CreateTimerDto } from './dto/create-timer.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('定时任务')
@Controller('timer')
export class TimerController {
  constructor(
    private readonly timerService: TimerService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @ApiOperation({ summary: '创建一个定时任务' })
  @Post()
  async create(@Body() createTimerDto: CreateTimerDto) {
    const timer = await this.timerService.create(createTimerDto);
    // 创建定时任务
    const job = new CronJob(timer.value, async () => {
      // 这里是执行的脚本
      if (timer.logger) {
        // 记录日志
        await this.timerService.createRunLog({
          timerId: timer.id,
          result: true,
        });
      }
    });

    // 添加定时任务
    await this.schedulerRegistry.addCronJob(timer.name, job);
  }

  @ApiOperation({ summary: '启动一个定时任务' })
  @Post('enable/:id')
  async enable(@Param('id') id: string) {
    const timer = await this.timerService.findOne(+id);
    const job = this.schedulerRegistry.getCronJob(timer.name);
    job.start();
    return {};
  }

  @ApiOperation({ summary: '停止一个定时任务' })
  @Post('disable/:id')
  async disable(@Param('id') id: string) {
    const timer = await this.timerService.findOne(+id);
    const job = this.schedulerRegistry.getCronJob(timer.name);
    job.stop();
    return {};
  }

  @ApiOperation({ summary: '获取定时任务的下次运行时间' })
  @Get('nextTime/:id')
  async nextTime(@Param('id') id: string) {
    const timer = await this.timerService.findOne(+id);
    const job = this.schedulerRegistry.getCronJob(timer.name);
    return { time: job.nextDate() };
  }

  @ApiOperation({ summary: '获取定时任务的下次运行时间列表' })
  @Get('nextTimes/:id')
  async nextTimes(@Param('id') id: string) {
    const timer = await this.timerService.findOne(+id);
    const job = this.schedulerRegistry.getCronJob(timer.name);
    return { times: job.nextDates() };
  }

  @ApiOperation({ summary: '查询所有定时任务' })
  @Get()
  findAll() {
    return this.timerService.findAll();
  }

  @ApiOperation({ summary: '查询单个定时任务' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timerService.findOne(+id);
  }

  @ApiOperation({ summary: '删除单个定时任务' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.timerService.remove(+id);
    const timer = await this.timerService.findOne(+id);
    if (result.affected > 0) {
      await this.schedulerRegistry.deleteCronJob(timer.name);
    }
    return {};
  }
}
