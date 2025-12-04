import { Module } from '@nestjs/common';
import { VerifyService } from './verify.service';
import { VerifyController } from './verify.controller';
import { PinataService } from '../common/pinata.service';
import { FilNoteContractService } from '../common/filnote-contract.service';
import { EncryptModule } from '../encrypt/encrypt.module';

@Module({
  imports: [EncryptModule],
  controllers: [VerifyController],
  providers: [VerifyService, PinataService, FilNoteContractService],
})
export class VerifyModule {}
