import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common';
import { VerifyService } from './verify.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadVerifyDto } from './dto/upload-verify.dto';
import { extname } from 'path';

@Controller('verify')
export class VerifyController {
  constructor(private readonly verifyService: VerifyService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['application/pdf'];
        const allowedExtensions = ['.pdf'];

        // Check mimetype / 检查 MIME 类型
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Unsupported file type'), false);
        }

        // Check file extension / 检查文件扩展名
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
          return cb(new BadRequestException('Invalid file extension'), false);
        }

        cb(null, true);
      },
      limits: { fileSize: 1024 * 512, files: 1 }, // 512KB & single file / 512KB 且单文件
    }),
  )
  async uploadFile(
    @Body() dto: UploadVerifyDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.buffer) {
      throw new BadRequestException('File buffer is required');
    }

    // Validate file content (PDF header) / 验证文件内容（PDF 文件头）
    const pdfHeader = Buffer.from(file.buffer).subarray(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      throw new BadRequestException('Invalid PDF file format');
    }

    const result = await this.verifyService.uploadFile(
      dto.signature,
      dto.address,
      file.buffer,
      file.originalname,
    );
    return result;
  }

  @Get('get-verify-uuid/:address')
  async getVerifyUUID(@Param('address') address: string) {
    const result = await this.verifyService.getVerifyUUID(address);
    return result;
  }
}
