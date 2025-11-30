import { IsString, IsNotEmpty } from 'class-validator';

export class EncryptHashDto {
  @IsString()
  @IsNotEmpty()
  hashUrl: string;
}
