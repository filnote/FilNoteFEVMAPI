import { Controller, Post, Body } from '@nestjs/common';
import { EncryptService } from './encrypt.service';
import { EncryptHashDto } from './dto/encrypt-hash.dto';

@Controller('encrypt')
export class EncryptController {
  constructor(private readonly encryptService: EncryptService) {}

  /**
   * Encrypt hash URL for creator's privacy certificate [为创建者的隐私凭证加密 hash URL]
   * POST /encrypt/privacy-certificate
   */
  @Post('privacy-certificate')
  encryptPrivacyCertificate(@Body() dto: EncryptHashDto) {
    const encryptedHash = this.encryptService.encryptHashUrl(dto.hashUrl);
    return {
      encryptedHash,
      originalHash: dto.hashUrl,
    };
  }
}
