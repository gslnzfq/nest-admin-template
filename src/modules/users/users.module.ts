import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@/modules/users/users.entity';
import { UsersController } from './users.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { ThirdUserEntity } from '@/modules/users/third-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, ThirdUserEntity]),
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
