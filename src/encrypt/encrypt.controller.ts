import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EncryptService } from './encrypt.service';
import { DecryptHashDto } from './dto/decrypt-hash.dto';
import { CreatorOrInvestorGuard } from '../common/guards/creator-or-investor.guard';
import { NoteExistsGuard } from '../common/guards/note-exists.guard';

@Controller('encrypt')
export class EncryptController {
  constructor(private readonly encryptService: EncryptService) {}

  /**
   * Decrypt hash URL for creator or investor [为创建者或投资者解密 hash URL]
   * POST /encrypt/decrypt-hash
   * Requires note exists and creator or investor authentication [需要票据存在且创建者或投资者身份验证]
   */
  @Post('decrypt-hash')
  @UseGuards(NoteExistsGuard, CreatorOrInvestorGuard)
  decryptHash(@Body() dto: DecryptHashDto) {
    const decryptedHash = this.encryptService.decryptHashUrl(dto.encryptedHash);
    return {
      decryptedHash,
      noteId: dto.noteId,
    };
  }
}
