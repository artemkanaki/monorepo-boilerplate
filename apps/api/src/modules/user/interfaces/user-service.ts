import { IUser } from './user';
import { EmailVo } from '@lib/ddd';

export interface IVerifyEmailPayload {
  email: EmailVo;
  code: string;
}

export interface ICreateUserPayload {
  email: EmailVo;
  password: string;
}

export interface IUserService {
  sendEmailVerificationRequest(email: EmailVo): Promise<void>;
  verifyEmail(payload: IVerifyEmailPayload): Promise<void>;
  createUser(payload: ICreateUserPayload): Promise<IUser>;
}
