import { EmailVo } from '@lib/ddd';

export interface IVerifyEmailResponse {
  verified: boolean;
}

export interface IEmailVerificationPort {
  sendEmailVerification(email: EmailVo): Promise<void>;
  verifyEmail(email: EmailVo, code: string): Promise<IVerifyEmailResponse>;
  checkIfEmailVerified(email: EmailVo): Promise<IVerifyEmailResponse>;
}
