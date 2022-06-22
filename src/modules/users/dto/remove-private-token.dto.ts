import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemovePrivateTokenDto {
  @IsString()
  @ApiProperty({ description: 'token' })
  token: string;
}
