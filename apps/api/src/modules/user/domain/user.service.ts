import { Inject, Injectable } from '@nestjs/common';
import {
  ICreateUserPayload,
  IEmailVerificationPort,
  IUserRepositoryPort,
  IUserService,
  IVerifyEmailPayload,
} from '../interfaces';
import { EMAIL_VERIFICATION_ADAPTER, USER_REPOSITORY } from '../user.di';
import { UserEntity } from './entities';
import { EmailConflictError, InvalidEmailVerificationCodeError, UnverifiedEmailForbiddenError } from './errors';
import { EmailVo } from '@lib/ddd';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repo: IUserRepositoryPort,
    @Inject(EMAIL_VERIFICATION_ADAPTER) private readonly emailVerificationService: IEmailVerificationPort,
  ) {}

  public async sendEmailVerificationRequest(email: EmailVo): Promise<void> {
    const duplicate = await this.repo.findOne({ email });

    if (duplicate) {
      throw new EmailConflictError(email);
    }

    await this.emailVerificationService.sendEmailVerification(email);
  }

  public async verifyEmail({ email, code }: IVerifyEmailPayload) {
    let verified: boolean;
    try {
      const response = await this.emailVerificationService.verifyEmail(email, code);

      verified = response.verified;
    } catch (error) {
      verified = false;
    }

    if (!verified) {
      throw new InvalidEmailVerificationCodeError();
    }
  }

  public async createUser(payload: ICreateUserPayload): Promise<UserEntity> {
    const [duplicate, emailVerificationState] = await Promise.all([
      this.repo.findOne({ email: payload.email }),
      this.emailVerificationService.checkIfEmailVerified(payload.email),
    ]);
    if (duplicate) {
      throw new EmailConflictError(payload.email);
    }
    if (!emailVerificationState.verified) {
      throw new UnverifiedEmailForbiddenError();
    }

    const user = UserEntity.create(payload.email);

    await this.repo.save(user);

    return user;
  }
}
