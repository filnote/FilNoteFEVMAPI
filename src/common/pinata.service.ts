import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import { extname } from 'path';
import { lookup as mimeLookup } from 'mime-types';

interface PinataUploadResponse {
  data: {
    id: string;
    user_id: string;
    name: string;
    size: number;
    mime_type: string;
    cid: string;
    cid_version: string;
    network: string;
    is_duplicate: boolean;
    number_of_files: number;
    streamable: boolean;
    created_at: string;
    updated_at: string;
    vectorized: boolean;
  };
}

@Injectable()
export class PinataService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Upload file to Pinata IPFS / 上传文件到 Pinata IPFS
   * @param buffer File buffer / 文件缓冲区
   * @param filename Original filename / 原始文件名
   * @returns IPFS CID / 返回 IPFS CID
   */
  async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    try {
      const pinataJwt = this.configService.get<string>('PINATA_JWT');
      if (!pinataJwt) {
        throw new Error('PINATA_JWT is not set');
      }

      // Prepare form data / 准备表单数据
      const formData = new FormData();
      const mimeType =
        (mimeLookup(extname(filename)) as string) || 'application/pdf';
      formData.append('file', buffer, {
        filename,
        contentType: mimeType,
      });
      formData.append('network', 'public');

      // Send request to Pinata / 发送请求到 Pinata
      const response: AxiosResponse<PinataUploadResponse> = await axios.post(
        'https://uploads.pinata.cloud/v3/files',
        formData,
        {
          headers: {
            Authorization: `Bearer ${pinataJwt}`,
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );

      const result: PinataUploadResponse = response.data;

      // Extract CID / 提取 CID
      const cid = result.data?.cid;
      if (!cid) {
        throw new Error('Upload failed');
      }

      return cid;
    } catch (error) {
      const err = error as Error & {
        response?: { data?: unknown; status?: number };
        status?: number;
        statusCode?: number;
      };
      if (
        err.message.includes('401') ||
        err.message.includes('Not Authorized')
      ) {
        throw new Error(
          'Pinata authentication failed. Please check your PINATA_JWT token is valid and not expired.',
        );
      }
      throw new Error(err.message);
    }
  }
}
