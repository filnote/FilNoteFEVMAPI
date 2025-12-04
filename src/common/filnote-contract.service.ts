import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract, JsonRpcProvider } from 'ethers';
import { FilNoteABI } from '../utils/FilNoteABI';

/**
 * Note structure from contract [合约中的 Note 结构]
 */
export interface Note {
  id: number;
  creator: string;
  investor: string;
  targetAmount: bigint;
  platformFeeRateBps: bigint;
  platformFeeAmount: bigint;
  protocolContract: string;
  auditor: string;
  contractHash: string;
  privacyCertificateHash: string;
  privacyCredentialsAbridgedHash: string;
  expiryTime: bigint;
  createdAt: number;
  borrowingDays: number;
  interestRateBps: number;
  status: number;
}

@Injectable()
export class FilNoteContractService implements OnModuleInit {
  private provider: JsonRpcProvider;
  private contract: Contract;
  private rpcUrl: string;
  private contractAddress: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const contractAddress = this.configService.get<string>(
      'FIL_NOTE_CONTRACT_ADDRESS',
    );

    if (!rpcUrl || !contractAddress) {
      throw new Error(
        'RPC_URL or FIL_NOTE_CONTRACT_ADDRESS is not set in environment variables',
      );
    }

    this.rpcUrl = rpcUrl;
    this.contractAddress = contractAddress;
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    this.contract = new Contract(
      this.contractAddress,
      FilNoteABI,
      this.provider,
    );
  }

  /**
   * Get provider instance [获取 provider 实例]
   */
  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get contract instance [获取合约实例]
   */
  getContract(): Contract {
    return this.contract;
  }

  /**
   * Get note by ID [根据 ID 获取票据]
   * @param noteId Note ID [票据 ID]
   * @returns Note object [Note 对象]
   */
  async getNote(noteId: number): Promise<Note> {
    // Validate noteId [验证 noteId]
    if (!Number.isInteger(noteId) || noteId < 1) {
      throw new Error('Invalid note ID');
    }

    try {
      const note = (await this.contract.getNote(noteId)) as Note;
      return note;
    } catch {
      // Don't expose internal error details [不暴露内部错误详情]
      throw new Error('Failed to get note');
    }
  }

  /**
   * Check if note exists [检查票据是否存在]
   * @param noteId Note ID [票据 ID]
   * @returns True if note exists [如果票据存在返回 true]
   */
  async noteExists(noteId: number): Promise<boolean> {
    try {
      const note = await this.getNote(noteId);
      return note && note.id !== undefined && Number(note.id) !== 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if address is auditor [检查地址是否是审计员]
   * @param address Address to check [要检查的地址]
   * @returns True if address is auditor [如果是审计员返回 true]
   */
  async isAuditor(address: string): Promise<boolean> {
    try {
      const result = (await this.contract.isAuditor(address)) as boolean;
      return result;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to check auditor status: ${err.message}`);
    }
  }

  /**
   * Check if address is creator of note [检查地址是否是票据的创建者]
   * @param noteId Note ID [票据 ID]
   * @param address Address to check [要检查的地址]
   * @returns True if address is creator [如果是创建者返回 true]
   */
  async isCreator(noteId: number, address: string): Promise<boolean> {
    try {
      const note = await this.getNote(noteId);
      const normalizedNoteCreator = note.creator.toLowerCase();
      const normalizedAddress = address.toLowerCase();
      return normalizedNoteCreator === normalizedAddress;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to check creator status: ${err.message}`);
    }
  }

  /**
   * Check if address is investor of note [检查地址是否是票据的投资者]
   * @param noteId Note ID [票据 ID]
   * @param address Address to check [要检查的地址]
   * @returns True if address is investor [如果是投资者返回 true]
   */
  async isInvestor(noteId: number, address: string): Promise<boolean> {
    try {
      const note = await this.getNote(noteId);
      if (!note.investor) {
        return false;
      }
      const normalizedNoteInvestor = note.investor.toLowerCase();
      const normalizedAddress = address.toLowerCase();
      return normalizedNoteInvestor === normalizedAddress;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to check investor status: ${err.message}`);
    }
  }

  /**
   * Check if address is creator or investor of note [检查地址是否是票据的创建者或投资者]
   * @param noteId Note ID [票据 ID]
   * @param address Address to check [要检查的地址]
   * @returns True if address is creator or investor [如果是创建者或投资者返回 true]
   */
  async isCreatorOrInvestor(noteId: number, address: string): Promise<boolean> {
    const [isCreator, isInvestor] = await Promise.all([
      this.isCreator(noteId, address),
      this.isInvestor(noteId, address),
    ]);
    return isCreator || isInvestor;
  }

  /**
   * Call any contract method [调用任意合约方法]
   * @param methodName Method name [方法名]
   * @param args Method arguments [方法参数]
   * @returns Method result [方法结果]
   */
  async callMethod<T = unknown>(
    methodName: string,
    ...args: unknown[]
  ): Promise<T> {
    try {
      const method = this.contract[methodName];
      if (typeof method !== 'function') {
        throw new Error(`Method ${methodName} not found on contract`);
      }
      return (await method(...args)) as T;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to call ${methodName}: ${err.message}`);
    }
  }
}
