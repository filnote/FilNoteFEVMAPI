import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common';
import { VerifyService } from './verify.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadVerifyDto } from './dto/upload-verify.dto';
import { extname } from 'path';

@Controller('verify')
export class VerifyController {
  constructor(private readonly verifyService: VerifyService) {}

  @Post('upload')
  @UseInterceptors(
    AnyFilesInterceptor({
      fileFilter: (req, file, cb) => {
        // Only allow PDF files [只允许 PDF 文件]
        if (file) {
          const allowedMimeTypes = ['application/pdf'];
          const allowedExtensions = ['.pdf'];

          // Check mimetype [检查 MIME 类型]
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new BadRequestException('Unsupported file type'), false);
          }

          // Check file extension [检查文件扩展名]
          const ext = extname(file.originalname).toLowerCase();
          if (!allowedExtensions.includes(ext)) {
            return cb(new BadRequestException('Invalid file extension'), false);
          }
        }

        cb(null, true);
      },
      limits: { fileSize: 1024 * 512, files: 2 }, // 512KB per file, max 2 files [每个文件 512KB，最多 2 个文件]
    }),
  )
  async uploadFiles(
    @Body() dto: UploadVerifyDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Either contract file or jsonData must be provided [必须提供合同文件或 jsonData]
    if ((!files || files.length === 0) && !dto.jsonData) {
      throw new BadRequestException(
        'Either contract file or jsonData is required',
      );
    }

    // Find contract and privacy certificate files [查找合同和隐私凭证文件]
    // If only one file is uploaded, it's the contract [如果只上传一个文件，则是合同]
    // If two files are uploaded, identify by fieldname [如果上传两个文件，通过 fieldname 识别]
    const contractFileCandidate =
      files && files.length > 0
        ? files.length === 1
          ? files[0]
          : files.find((f) => f.fieldname === 'contract')
        : undefined;
    const privacyCertificateFile =
      files && files.length > 0
        ? files.find((f) => f.fieldname === 'privacyCertificate')
        : undefined;

    // Validate contract file if provided [如果提供了合同文件，则验证]
    if (contractFileCandidate) {
      if (!contractFileCandidate.buffer) {
        throw new BadRequestException('Contract file buffer is required');
      }

      // Validate contract file content (PDF header) [验证合同文件内容（PDF 文件头）]
      const contractPdfHeader = Buffer.from(contractFileCandidate.buffer)
        .subarray(0, 4)
        .toString();
      if (contractPdfHeader !== '%PDF') {
        throw new BadRequestException('Invalid contract PDF file format');
      }
    }

    // Validate privacy certificate file if provided [如果提供了隐私凭证文件，则验证]
    if (privacyCertificateFile) {
      if (!privacyCertificateFile.buffer) {
        throw new BadRequestException(
          'Privacy certificate file buffer is required',
        );
      }

      // Validate privacy certificate file content (PDF header) [验证隐私凭证文件内容（PDF 文件头）]
      const privacyPdfHeader = Buffer.from(privacyCertificateFile.buffer)
        .subarray(0, 4)
        .toString();
      if (privacyPdfHeader !== '%PDF') {
        throw new BadRequestException(
          'Invalid privacy certificate PDF file format',
        );
      }
    }

    const result = await this.verifyService.uploadFiles(
      dto.signature,
      dto.address,
      contractFileCandidate?.buffer,
      contractFileCandidate?.originalname,
      privacyCertificateFile?.buffer,
      privacyCertificateFile?.originalname,
      dto.jsonData,
    );
    return result;
  }

  @Get('get-verify-uuid/:address')
  async getVerifyUUID(@Param('address') address: string) {
    const result = await this.verifyService.getVerifyUUID(address);
    return result;
  }
}
