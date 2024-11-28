import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';
import { Env } from '@lib/common';
import { DateVo, IdVo, DateTimeDuration } from '@lib/ddd';
import * as process from 'node:process';

const AUTH_TOKEN_NAME = 'auth-token';
const AUTH_TOKEN_EXPIRES_IN: DateTimeDuration = { weeks: 1 };

// this service is used only in infrastructure, so no need for an interface
@Injectable()
export class AuthService {
  public setAuthToken(res: Response, userId: IdVo) {
    this.getDomains().forEach((domain) => {
      res.cookie(AUTH_TOKEN_NAME, this.createToken(userId), {
        domain,
        httpOnly: true,
        secure: true,
        expires: DateVo.now().add(AUTH_TOKEN_EXPIRES_IN).value,
        sameSite: this.getCookieSameSite(),
        partitioned: true,
      });
    });
  }

  public extractUserId(req: Request): IdVo | undefined {
    const token = this.getAuthToken(req);
    if (!token) {
      return;
    }

    return this.getUserId(token);
  }

  public refreshToken(req: Request, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return;
    }

    this.setAuthToken(res, userId);
  }

  public clearAuthToken(res: Response) {
    this.getDomains().forEach((domain) => {
      res.cookie(AUTH_TOKEN_NAME, '', {
        domain,
        httpOnly: true,
        secure: true,
        expires: new Date(0),
        sameSite: this.getCookieSameSite(),
        partitioned: true,
      });
    });
  }

  private getCookieSameSite(): 'strict' | 'none' {
    return process.env.NODE_ENV === Env.PROD ? 'strict' : 'none';
  }

  private getDomains(): string[] {
    if (process.env.NODE_ENV === Env.PROD) {
      // TODO: Add real domain
    }

    return ['localhost'];
  }

  private getAuthToken(req: Request): string | undefined {
    return req.cookies?.[AUTH_TOKEN_NAME];
  }

  private createToken(userId: IdVo): string {
    return Buffer.from(userId.value).toString('base64');
  }

  private getUserId(token: string): IdVo {
    return new IdVo(Buffer.from(token, 'base64').toString());
  }
}
