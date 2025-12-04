import {
  IsEthereumAddress,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNameValueObject } from './validators/json-data.validator';

export class UploadVerifyDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]+$/)
  signature: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @Transform(({ value }): Record<string, unknown> | undefined => {
    // If value is already an object, return it [如果值已经是对象，直接返回]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    // If value is a string, try to parse it as JSON [如果值是字符串，尝试解析为 JSON]
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          !Array.isArray(parsed)
        ) {
          return parsed as Record<string, unknown>;
        }
        return undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  })
  @IsNameValueObject()
  jsonData?: Record<string, unknown>;
}
