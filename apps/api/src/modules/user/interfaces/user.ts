import { DateVo, EmailVo, IdVo } from '@lib/ddd';
import { IEmailVerificationPort } from './email-verification.port';

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IUser {
  id: IdVo;
  email: EmailVo;
  kycStatus: KycStatus;
  createdAt: DateVo;
  updatedAt: DateVo;

  setKycStatus(status: KycStatus): void;

  sendEmailVerification(verificationService: IEmailVerificationPort): Promise<void>;
}
