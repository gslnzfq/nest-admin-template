import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePrivateTokenDto {
  @IsString()
  @ApiProperty({ description: '过期时间' })
  expiresIn: string;
}
