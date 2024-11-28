import {
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { KycStatus } from '../../interfaces';

export class ChangeKycStatusBody {
  @IsEnum(KycStatus)
  @ApiProperty({
    enum: KycStatus,
    description: 'The KYC status of the user account',
  })
  kycStatus: KycStatus;
}
