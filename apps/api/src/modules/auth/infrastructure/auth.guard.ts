import { CanActivate, Injectable } from '@nestjs/common';
import { ContextService } from '@lib/context';

@Injectable()
export class AuthGuard implements CanActivate {
  public canActivate(): boolean {
    const userId = ContextService.getUserId();

    // as of now we assume that if the user id is present in the context, the user is authenticated
    return !!userId;
  }
}
