import { Module } from '@nestjs/common';
import { EncryptController } from './encrypt.controller';
import { EncryptService } from './encrypt.service';

@Module({
  controllers: [EncryptController],
  providers: [EncryptService],
  exports: [EncryptService],
})
export class EncryptModule {}
