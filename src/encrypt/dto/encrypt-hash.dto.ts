import { IsString, IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class EncryptHashDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048) // Reasonable URL length limit [合理的 URL 长度限制]
  hashUrl: string;
}
