import { Module } from '@nestjs/common';
import { EncryptController } from './encrypt.controller';
import { EncryptService } from './encrypt.service';
import { CreatorOrInvestorGuard } from '../common/guards/creator-or-investor.guard';
import { NoteExistsGuard } from '../common/guards/note-exists.guard';
import { FilNoteContractService } from '../common/filnote-contract.service';

@Module({
  controllers: [EncryptController],
  providers: [
    EncryptService,
    CreatorOrInvestorGuard,
    NoteExistsGuard,
    FilNoteContractService,
  ],
  exports: [EncryptService],
})
export class EncryptModule {}
