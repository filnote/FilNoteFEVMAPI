import {
  IsEthereumAddress,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class UploadVerifyDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]+$/)
  signature: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  address: string;
}
