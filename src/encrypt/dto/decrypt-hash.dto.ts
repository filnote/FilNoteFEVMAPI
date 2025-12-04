import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsEthereumAddress,
  Matches,
  Length,
} from 'class-validator';

export class DecryptHashDto {
  @IsString()
  @IsNotEmpty()
  @Length(32, 10000) // Minimum base64 length for IV + authTag, max reasonable length [最小 base64 长度用于 IV + authTag，最大合理长度]
  encryptedHash: string;

  @IsInt()
  @Min(1)
  noteId: number;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]+$/)
  signature: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  address: string;
}
