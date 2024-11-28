import { IEmailVerificationPort, IVerifyEmailResponse } from '../../interfaces';
import { EmailVo } from '@lib/ddd';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE, ICacheService } from '@lib/cache';
import * as randomstring from 'randomstring';
import { Env } from '@lib/common';

const EMAIL_VERIFICATION_CODE_EXPIRATION = 60 * 60; // 1 hour
const EMAIL_CACHE_PREFIX = 'email-verification-code';
const DEV_VERIFICATION_CODE = '123456';

@Injectable()
export class EmailVerificationService implements IEmailVerificationPort {
  constructor(@Inject(CACHE_SERVICE) private readonly cacheService: ICacheService) {}

  public async sendEmailVerification(email: EmailVo): Promise<void> {
    await this.cacheService.hSet(
      this.buildCacheKey(email),
      {
        code: this.generateCode(),
        verified: 'false',
      },
      EMAIL_VERIFICATION_CODE_EXPIRATION,
    );

    // TODO: send email once email service is implemented
  }

  public async verifyEmail(email: EmailVo, code: string): Promise<IVerifyEmailResponse> {
    const cacheKey = this.buildCacheKey(email);
    const cachedCode = await this.cacheService.hGet(cacheKey, 'code');

    if (!cachedCode || code !== cachedCode) {
      return { verified: false };
    }

    await this.cacheService.hSet(cacheKey, { code: cachedCode, verified: 'true' }, EMAIL_VERIFICATION_CODE_EXPIRATION);

    return { verified: true };
  }

  public async checkIfEmailVerified(email: EmailVo): Promise<IVerifyEmailResponse> {
    const cacheKey = this.buildCacheKey(email);
    const verified = await this.cacheService.hGet(cacheKey, 'verified');

    return { verified: verified === 'true' };
  }

  private buildCacheKey(email: EmailVo): string {
    return `${EMAIL_CACHE_PREFIX}:${email.value}`;
  }

  private generateCode(): string {
    return process.env.NODE_ENV === Env.DEV
      ? DEV_VERIFICATION_CODE
      : randomstring.generate({
          length: 6,
          charset: 'numeric',
        });
  }
}
