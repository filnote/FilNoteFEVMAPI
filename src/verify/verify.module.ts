import { Module } from '@nestjs/common';
import { VerifyService } from './verify.service';
import { VerifyController } from './verify.controller';
import { PinataService } from '../common/pinata.service';

@Module({
  controllers: [VerifyController],
  providers: [VerifyService, PinataService],
})
export class VerifyModule {}
