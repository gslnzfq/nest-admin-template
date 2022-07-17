import { ApiProperty } from '@nestjs/swagger';
import { Systeminformation } from 'systeminformation';

export class PlatformInfoDto {
  @ApiProperty({ description: '版本信息' })
  versions: Systeminformation.VersionData;

  @ApiProperty({ description: 'OS信息' })
  osInfo: Systeminformation.OsData;

  @ApiProperty({ description: 'CPU信息' })
  cpuInfo: Systeminformation.CpuData;

  @ApiProperty({ description: '负载信息' })
  currentLoadInfo: Systeminformation.CurrentLoadData;

  @ApiProperty({ description: '内存信息' })
  memInfo: Systeminformation.MemData;

  @ApiProperty({ description: '时间信息' })
  time: Systeminformation.TimeData;
}
