import {
  IsEthereumAddress,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';
import { IsNameValueObject } from './validators/json-data.validator';

export class UploadVerifyDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]+$/)
  signature: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsNameValueObject()
  jsonData?: Record<string, unknown>;
}
