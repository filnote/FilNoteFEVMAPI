import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { FilNoteContractService } from '../filnote-contract.service';

interface RequestWithNote {
  note?: {
    id: number;
    creator: string;
    investor: string;
    [key: string]: unknown;
  };
  body?: {
    noteId?: number;
    [key: string]: unknown;
  };
}

@Injectable()
export class NoteExistsGuard implements CanActivate {
  constructor(
    private readonly filNoteContractService: FilNoteContractService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithNote>();
    const body = request.body;

    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    const noteId = body.noteId;

    if (noteId === undefined || noteId === null) {
      throw new BadRequestException('Note ID is required');
    }

    // Validate noteId type and range [验证 noteId 类型和范围]
    if (typeof noteId !== 'number' || !Number.isInteger(noteId) || noteId < 1) {
      throw new BadRequestException('Invalid note ID format');
    }

    // Validate noteId is within safe range [验证 noteId 在安全范围内]
    if (noteId > Number.MAX_SAFE_INTEGER) {
      throw new BadRequestException('Note ID is too large');
    }

    // Verify note exists on-chain [链上验证票据是否存在]
    try {
      // Get note from contract [从合约获取票据]
      const note = await this.filNoteContractService.getNote(noteId);

      // Check if note exists (id should not be 0) [检查票据是否存在（id 不应为 0）]
      if (!note || !note.id || Number(note.id) === 0) {
        throw new BadRequestException('Note does not exist');
      }

      // Attach note to request for use in controllers [将票据附加到请求对象供控制器使用]
      request.note = {
        id: note.id,
        creator: note.creator,
        investor: note.investor,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // If contract call fails, note likely doesn't exist [如果合约调用失败，票据可能不存在]
      throw new BadRequestException('Note does not exist or failed to fetch');
    }

    return true;
  }
}
