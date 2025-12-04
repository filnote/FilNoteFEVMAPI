import { Module } from '@nestjs/common';
import { VerifyService } from './verify.service';
import { VerifyController } from './verify.controller';
import { PinataService } from '../common/pinata.service';
import { FilNoteContractService } from '../common/filnote-contract.service';

@Module({
  controllers: [VerifyController],
  providers: [VerifyService, PinataService, FilNoteContractService],
})
export class VerifyModule {}
