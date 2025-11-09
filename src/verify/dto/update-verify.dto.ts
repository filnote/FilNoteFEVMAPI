import { PartialType } from '@nestjs/mapped-types';
import { CreateVerifyDto } from './create-verify.dto';

export class UpdateVerifyDto extends PartialType(CreateVerifyDto) {}
