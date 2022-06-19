import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { EmailModule } from '@/modules/email/email.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AuthModule, EmailModule, HttpModule],
  controllers: [TestController],
})
export class TestModule {}
