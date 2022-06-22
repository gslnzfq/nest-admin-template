import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@/modules/users/entities/users.entity';
import { UsersController } from './users.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { ThirdUserEntity } from '@/modules/users/entities/third-user.entity';
import { PrivateTokenEntity } from '@/modules/users/entities/private-token.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([
      UsersEntity,
      ThirdUserEntity,
      PrivateTokenEntity,
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
