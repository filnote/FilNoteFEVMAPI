import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract } from 'ethers';
import { FilNoteABI } from '../../utils/FilNoteABI';
import { normalizeAddress } from '../../utils/verify.service.utils';
import {
  openDb,
  getVerifyIdByAddress,
  saveDb,
} from '../../utils/verify.service.utils';

interface RequestWithVerifiedAddress {
  verifiedAddress?: string;
  body?: {
    address?: string;
    signature?: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class AuditorGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithVerifiedAddress>();
    const body = request.body;

    if (!body) {
      throw new UnauthorizedException('Request body is required');
    }

    // Extract address and signature from request body [从请求体中提取地址和签名]
    const address = body.address;
    const signature = body.signature;

    if (!address || !signature) {
      throw new UnauthorizedException('Address and signature are required');
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

    // Verify auditor status on-chain [链上验证审计员状态]
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const filNoteAddress = this.configService.get<string>(
      'FIL_NOTE_CONTRACT_ADDRESS',
    );

    if (!rpcUrl || !filNoteAddress) {
      throw new Error('RPC_URL or FIL_NOTE_CONTRACT_ADDRESS is not set');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new Contract(filNoteAddress, FilNoteABI, provider);

    try {
      const isAuditor = (await contract.isAuditor(
        normalizedAddress,
      )) as boolean;
      if (!isAuditor) {
        throw new UnauthorizedException('You are not an auditor');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }

    // Delete UUID after successful verification [验证成功后删除 UUID]
    try {
      delete db.data.verifications[normalizedAddress];
      await saveDb(db);
    } catch {
      // Ignore save errors [忽略保存错误]
    }

    // Attach verified address to request [将验证的地址附加到请求对象]
    request.verifiedAddress = normalizedAddress;

    return true;
  }
}
