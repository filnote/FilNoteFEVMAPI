import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { normalizeAddress } from '../../utils/verify.service.utils';
import {
  openDb,
  getVerifyIdByAddress,
  saveDb,
} from '../../utils/verify.service.utils';
import { FilNoteContractService } from '../filnote-contract.service';

interface RequestWithVerifiedAddress {
  verifiedAddress?: string;
  verifiedNoteId?: number;
  note?: {
    id: number;
    creator: string;
    investor: string;
    [key: string]: unknown;
  };
  body?: {
    address?: string;
    signature?: string;
    noteId?: number;
    [key: string]: unknown;
  };
}

@Injectable()
export class CreatorOrInvestorGuard implements CanActivate {
  constructor(
    private readonly filNoteContractService: FilNoteContractService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithVerifiedAddress>();
    const body = request.body;

    if (!body) {
      throw new UnauthorizedException('Request body is required');
    }

    // Extract address, signature, and noteId from request body [从请求体中提取地址、签名和 noteId]
    const address = body.address;
    const signature = body.signature;
    const noteId = body.noteId;

    if (!address || !signature) {
      throw new UnauthorizedException('Address and signature are required');
    }

    if (noteId === undefined || noteId === null) {
      throw new UnauthorizedException('Note ID is required');
    }

    // Validate noteId type and range [验证 noteId 类型和范围]
    if (typeof noteId !== 'number' || !Number.isInteger(noteId) || noteId < 1) {
      throw new UnauthorizedException('Invalid note ID format');
    }

    // Validate noteId is within safe range [验证 noteId 在安全范围内]
    if (noteId > Number.MAX_SAFE_INTEGER) {
      throw new UnauthorizedException('Note ID is too large');
    }

    // Normalize address [标准化地址]
    const normalizedAddress = normalizeAddress(address);

    // Verify signature using UUID from database [使用数据库中的 UUID 验证签名]
    const db = await openDb();
    const storedVerifyId = getVerifyIdByAddress(
      db.data.verifications,
      normalizedAddress,
    );

    if (!storedVerifyId) {
      throw new UnauthorizedException('Permission error');
    }

    let recoveredAddress: string;
    try {
      if (!signature || typeof signature !== 'string') {
        throw new UnauthorizedException('Invalid signature format');
      }
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

    // Verify user is creator or investor of the note [验证用户是票据的创建者或投资者]
    try {
      const isCreatorOrInvestor =
        await this.filNoteContractService.isCreatorOrInvestor(
          noteId,
          normalizedAddress,
        );

      if (!isCreatorOrInvestor) {
        throw new UnauthorizedException(
          'You are not the creator or investor of this note',
        );
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to verify note ownership');
    }

    // Attach verified address and noteId to request [将验证的地址和 noteId 附加到请求对象]
    request.verifiedAddress = normalizedAddress;
    request.verifiedNoteId = noteId;

    return true;
  }
}
