import { Injectable, NestMiddleware } from '@nestjs/common';
import { ContextService } from '@lib/context';
import { Request, Response } from 'express';

@Injectable()
export class ContextMiddleware implements NestMiddleware<Request, Response> {
  use(req: Request, _res: Response, next: (error?: Error | any) => void) {
    ContextService.runInContext(next, {
      path: req.path,
      pathMask: req.route?.path,
      method: req.method,
      ip: req.ip || req.ips[0],
    });
  }
}
