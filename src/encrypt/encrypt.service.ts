import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

@Injectable()
export class EncryptService {
  private wallet: ethers.Wallet;
  private readonly algorithm = 'aes-256-gcm';

  constructor(private readonly configService: ConfigService) {
    const privateKey = this.configService.get<string>(
      'PLATFORM_WALLET_PRIVATE_KEY',
    );
    if (!privateKey) {
      throw new Error('PLATFORM_WALLET_PRIVATE_KEY is not set');
    }
    this.wallet = new ethers.Wallet(privateKey);
  }

  /**
   * Encrypt hash URL using platform wallet [使用平台钱包加密 hash URL]
   * @param hashUrl The hash URL to encrypt [要加密的 hash URL]
   * @returns Encrypted hash URL (base64 encoded) [加密后的 hash URL（base64 编码）]
   */
  encryptHashUrl(hashUrl: string): string {
    try {
      // Derive encryption key from wallet private key [从钱包私钥派生加密密钥]
      const privateKeyBytes = ethers.getBytes(this.wallet.privateKey);
      const key = crypto
        .createHash('sha256')
        .update(Buffer.from(privateKeyBytes))
        .digest();

      // Generate a random IV (initialization vector) [生成随机 IV（初始化向量）]
      const iv = crypto.randomBytes(16);

      // Create cipher [创建加密器]
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      // Encrypt the hash URL [加密 hash URL]
      let encrypted = cipher.update(hashUrl, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag [获取认证标签]
      const authTag = cipher.getAuthTag();

      // Combine IV + authTag + encrypted data [组合 IV + authTag + 加密数据]
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'base64'),
      ]);

      // Return base64 encoded result [返回 base64 编码的结果]
      return combined.toString('base64');
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(`Encryption failed: ${err.message}`);
    }
  }
}
