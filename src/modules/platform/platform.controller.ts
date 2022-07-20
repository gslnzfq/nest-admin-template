import { Controller, Get } from '@nestjs/common';
import { IgnoreAuthCheck } from '@/decorators/ignore-auth-check';
import * as sys from 'systeminformation';
import { PlatformInfoDto } from '@/modules/platform/dto/PlatformInfo.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@/decorators/success-response';

@IgnoreAuthCheck()
@ApiTags('平台信息')
@Controller('platform')
export class PlatformController {
  @Get()
  @ApiOperation({ summary: '获取平台信息' })
  @ApiSuccessResponse({ model: PlatformInfoDto })
  async info() {
    const [versions, osInfo, cpuInfo, memInfo, time] = (
      await Promise.allSettled([
        sys.versions('node, npm, yarn, redis'),
        sys.osInfo(),
        sys.cpu(),
        sys.mem(),
        sys.time(),
      ])
    ).map((p: any) => p.value);

    return {
      versions,
      osInfo,
      cpuInfo,
      memInfo,
      time,
    };
  }
}
