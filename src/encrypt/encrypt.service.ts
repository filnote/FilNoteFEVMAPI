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

  /**
   * Decrypt hash URL using platform wallet [使用平台钱包解密 hash URL]
   * @param encryptedHash Encrypted hash URL (base64 encoded) [加密的 hash URL（base64 编码）]
   * @returns Decrypted hash URL [解密后的 hash URL]
   */
  decryptHashUrl(encryptedHash: string): string {
    try {
      // Validate input [验证输入]
      if (!encryptedHash || typeof encryptedHash !== 'string') {
        throw new BadRequestException('Invalid encrypted hash format');
      }

      // Validate base64 format [验证 base64 格式]
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;
      if (!base64Regex.test(encryptedHash)) {
        throw new BadRequestException('Invalid base64 format');
      }

      // Decode base64 string [解码 base64 字符串]
      let combined: Buffer;
      try {
        combined = Buffer.from(encryptedHash, 'base64');
      } catch {
        throw new BadRequestException('Failed to decode base64 string');
      }

      // Validate minimum length (IV: 16 bytes + authTag: 16 bytes = 32 bytes minimum) [验证最小长度（IV: 16 字节 + authTag: 16 字节 = 至少 32 字节）]
      if (combined.length < 32) {
        throw new BadRequestException('Encrypted hash is too short');
      }

      // Extract IV (first 16 bytes) [提取 IV（前 16 字节）]
      const iv = combined.subarray(0, 16);

      // Extract authTag (next 16 bytes) [提取 authTag（接下来 16 字节）]
      const authTag = combined.subarray(16, 32);

      // Extract encrypted data (remaining bytes) [提取加密数据（剩余字节）]
      const encrypted = combined.subarray(32);

      // Validate encrypted data is not empty [验证加密数据不为空]
      if (encrypted.length === 0) {
        throw new BadRequestException('Encrypted data is empty');
      }

      // Derive decryption key from wallet private key [从钱包私钥派生解密密钥]
      const privateKeyBytes = ethers.getBytes(this.wallet.privateKey);
      const key = crypto
        .createHash('sha256')
        .update(Buffer.from(privateKeyBytes))
        .digest();

      // Create decipher [创建解密器]
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt the hash URL [解密 hash URL]
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(`Decryption failed: ${err.message}`);
    }
  }
}
