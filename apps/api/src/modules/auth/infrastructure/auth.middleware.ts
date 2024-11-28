import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ContextService } from '@lib/context';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  public use(req: Request, res: Response, next: NextFunction): any {
    this.authService.refreshToken(req, res);
    const userId = this.authService.extractUserId(req);

    if (userId) {
      ContextService.setUserId(userId);
    }

    next();
  }
}
