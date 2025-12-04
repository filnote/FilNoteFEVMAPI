import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { PinataService } from '../common/pinata.service';
import { FilNoteContractService } from '../common/filnote-contract.service';
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
  ) {}
  async uploadFile(
    signature: string,
    address: string,
    buffer: Buffer,
    originalFilename: string,
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

    // Upload to Pinata / 上传到 Pinata
    const cid = await this.pinataService.uploadFile(buffer, originalFilename);
    return cid;
  }

  async uploadJson(
    signature: string,
    address: string,
    jsonData: Record<string, unknown>,
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

    // Upload JSON to Pinata [上传 JSON 到 Pinata]
    const cid = await this.pinataService.uploadJson(
      jsonData,
      'privacy-credentials.json',
    );
    return cid;
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
