import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { PinataService } from '../common/pinata.service';
import { FilNoteContractService } from '../common/filnote-contract.service';
import { EncryptService } from '../encrypt/encrypt.service';
import {
  openDb,
  pruneExpired,
  saveDb,
  normalizeAddress,
  getVerifyIdByAddress,
} from '../utils/verify.service.utils';

@Injectable()
export class VerifyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly pinataService: PinataService,
    private readonly filNoteContractService: FilNoteContractService,
    private readonly encryptService: EncryptService,
  ) {}

  /**
   * Upload contract, privacy certificate files, and/or jsonData [上传合同、隐私凭证文件和/或 jsonData]
   * @param signature Signature for authentication [用于身份验证的签名]
   * @param address Auditor address [审计员地址]
   * @param contractBuffer Contract file buffer (required) [合同文件缓冲区（必填）]
   * @param contractFilename Contract file name (required) [合同文件名（必填）]
   * @param privacyCertificateBuffer Privacy certificate file buffer (optional) [隐私凭证文件缓冲区（可选）]
   * @param privacyCertificateFilename Privacy certificate file name (optional) [隐私凭证文件名（可选）]
   * @param jsonData Preview version of privacy certificate - public information that can be viewed without investment [隐私凭证的预览版本 - 对外可见的信息，无需投资即可查看]
   *                 Required if privacyCertificateBuffer is provided, optional otherwise [如果提供了 privacyCertificateBuffer 则必填，否则可选]
   * @returns Object with contractHash, encryptedPrivacyCertificateHash, and privacyCredentialsAbridgedHash [返回包含 contractHash、encryptedPrivacyCertificateHash 和 privacyCredentialsAbridgedHash 的对象]
   */
  async uploadFiles(
    signature: string,
    address: string,
    contractBuffer: Buffer,
    contractFilename: string,
    privacyCertificateBuffer?: Buffer,
    privacyCertificateFilename?: string,
    jsonData?: Record<string, unknown>,
  ) {
    const db = await openDb();
    const normalizedAddress = normalizeAddress(address);

    const storedVerifyId = getVerifyIdByAddress(
      db.data.verifications,
      normalizedAddress,
    );
    if (!storedVerifyId) {
      throw new UnauthorizedException('Permission error');
    }

    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(storedVerifyId, signature);
    } catch {
      throw new UnauthorizedException('Invalid signature format');
    }

    const normalizedRecovered = normalizeAddress(recoveredAddress);
    if (normalizedRecovered !== normalizedAddress) {
      throw new UnauthorizedException('Signature mismatch');
    }

    // Delete UUID immediately after signature verification to prevent replay attacks [签名验证后立即删除 UUID 以防止重放攻击]
    try {
      delete db.data.verifications[normalizedAddress];
      await saveDb(db);
    } catch {
      // Ignore save errors [忽略保存错误]
    }

    try {
      const isAuditor =
        await this.filNoteContractService.isAuditor(normalizedAddress);
      if (!isAuditor) {
        throw new UnauthorizedException('You are not an auditor');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }

    // Contract file is required [合同文件是必填的]
    if (!contractBuffer || !contractFilename) {
      throw new BadRequestException('Contract file is required');
    }

    // Upload contract to Pinata [上传合同文件到 Pinata]
    const contractHash = await this.pinataService.uploadFile(
      contractBuffer,
      contractFilename,
    );

    const result: {
      contractHash: string;
      encryptedPrivacyCertificateHash?: string;
      privacyCredentialsAbridgedHash?: string;
    } = {
      contractHash,
    };

    // Upload and encrypt privacy certificate if provided [如果提供了隐私凭证，则上传并加密]
    if (privacyCertificateBuffer && privacyCertificateFilename) {
      const privacyCertificateHash = await this.pinataService.uploadFile(
        privacyCertificateBuffer,
        privacyCertificateFilename,
      );

      // Encrypt the privacy certificate IPFS hash [加密隐私凭证的 IPFS 哈希]
      const encryptedPrivacyCertificateHash =
        this.encryptService.encryptHashUrl(privacyCertificateHash);

      result.encryptedPrivacyCertificateHash = encryptedPrivacyCertificateHash;
    }

    // Upload jsonData to Pinata if provided (preview version of privacy certificate) [如果提供了 jsonData，则上传到 Pinata（隐私凭证的预览版本）]
    if (jsonData) {
      const privacyCredentialsAbridgedHash =
        await this.pinataService.uploadJson(
          jsonData,
          'privacy-credentials.json',
        );
      result.privacyCredentialsAbridgedHash = privacyCredentialsAbridgedHash;
    }

    return result;
  }

  async getVerifyUUID(
    address: string,
    ttlMs = this.configService.get<number>('VERIFY_ID_TTL_MS') ?? 5 * 60 * 1000,
  ) {
    const db = await openDb();
    if (!db.data) db.data = { verifications: {} };
    if (!db.data.verifications) db.data.verifications = {};

    const normalizedAddress = normalizeAddress(address);
    pruneExpired(db.data.verifications);

    const existing = db.data.verifications[normalizedAddress];
    const nowTs = Date.now();

    // Generate new UUID if not exists or expired / 如果不存在或已过期则生成新的 UUID
    if (
      !existing ||
      typeof existing.expiresAt !== 'number' ||
      existing.expiresAt <= nowTs
    ) {
      const uuid = uuidv4();
      db.data.verifications[normalizedAddress] = {
        expiresAt: nowTs + ttlMs,
        uuid,
      };
      await saveDb(db);
      return uuid;
    }

    // Return existing UUID if valid and not expired / 如果有效且未过期则返回现有 UUID
    return existing.uuid;
  }
}
