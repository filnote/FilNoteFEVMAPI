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
import { ConfigService } from '@nestjs/config';
import { UploadVerifyDto } from './dto/upload-verify.dto';

@Controller('verify')
export class VerifyController {
  constructor(
    private readonly verifyService: VerifyService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Unsupported file type'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 1024 * 512, files: 1 }, // 512KB & single file
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
